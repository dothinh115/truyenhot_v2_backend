import { User } from '@/core/user/schema/user.schema';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Route } from '../route/schema/route.schema';
import { Permission } from '../permission/schema/permission.schema';
import settings from '../../settings.json';

@Injectable()
export class RolesGuard implements CanActivate {
  models = [];
  constructor(
    @InjectModel(Route.name) private routeModel: Model<Route>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.models = global.models;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { method, route, params } = req;

    //xác định route nào đang dc gọi
    let url: string = route.path;
    const routeCacheKey = `route:${url}:${method.toLowerCase()}`;
    let currentRoute: any = await this.cacheManager.get(routeCacheKey);

    if (!currentRoute) {
      currentRoute = await this.routeModel.findOne({
        path: url,
        method: method.toLowerCase(),
      });
      await this.cacheManager.set(routeCacheKey, currentRoute || '', 60000);
    }

    let user: any;
    //extract user và đưa vào request
    if (req.headers.authorization) {
      user = await this.extractUser(req);
      if (!user) throw new UnauthorizedException();
      req.user = user;
    }
    if (method.toLowerCase() === 'post' && user) {
      req.body = {
        ...req.body,
        recordCreater: user._id,
      };
    }
    //nếu chưa có route này thì xem có rơi vào những route đã exclude hay ko
    if (!currentRoute) {
      const match = url.match(/^\/[a-z]+[^\/]/);
      if (
        settings.EXCLUDED_ROUTE.includes(
          match[0]
            .split('/')
            .filter((x) => x !== '')
            .join(),
        )
      )
        return true; //nếu rơi vào những route đã exclude trong setting thì cho qua
      else return false;
    }

    const permissionCacheKey = `permission:${currentRoute._id}`;
    let permission: any = await this.cacheManager.get(permissionCacheKey);

    if (!permission) {
      permission = await this.permissionModel.findOne({
        route: currentRoute._id,
      });
      await this.cacheManager.set(permissionCacheKey, permission || '', 60000);
    }

    //check xem route đã dc phân quyền hay chưa
    if (permission) {
      //nếu đã phân quyền thì xem xét trường hợp route dc public, tức là roles = [], cho pass
      if (permission.roles.length === 0) return true;

      if (!user) throw new UnauthorizedException(); //nếu user chưa đăng nhập thì quăng 401

      //nếu đã đăng nhập thì tiếp tục xem xét nếu là rootUser thì pass
      if (user.rootUser) return true;

      //check xem khi patch và delete, có phải người này đang sửa record do mình tạo ra hay ko
      if (
        method.toLowerCase() === 'patch' ||
        method.toLowerCase() === 'delete'
      ) {
        const match = url.match(/[a-z]+[^/]/);
        const find = this.models.find((x) => x.name === match[0]);
        if (find) {
          const { id } = params;
          const model = find.model;
          const exist = await model.findById(id).select('+recordCreater');
          if (!exist) throw new BadRequestException('Không có record này!');
          if (exist.recordCreater === user._id) return true;
          else
            throw new BadRequestException(
              'Bạn không có quyền sửa hoặc xoá record này!',
            );
        }
      }

      //nếu ko phải là rootUser, đã phân quyền + đã đăng nhập, thì check tiếp xem role hiện tại của user có dc access hay ko
      if (permission.roles.includes(user.role)) return true;
    } else {
      //nếu chưa dc phân quyền thì rootUser vẫn dc đi qua
      if (!user) throw new UnauthorizedException(); //nếu user chưa đăng nhập thì quăng 401
      //nếu đã đăng nhập thì tiếp tục xem xét nếu là rootUser thì pass
      if (user.rootUser) return true;
    }

    return false;
  }

  async extractUser(req: Request) {
    const token = req.headers?.authorization
      .split('Bearer ')
      .filter((x) => x !== '')[0];

    if (!token) throw new UnauthorizedException();
    let user: any = await this.cacheManager.get(token);
    if (user) return user;
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      if (!decoded) throw new Error();
      const { _id } = decoded;
      const findUser = await this.userModel.findById(_id);
      user = findUser;
      await this.cacheManager.set(token, user || '', 60000);
    } catch (error) {
      throw new ForbiddenException();
    }
    return user;
  }
}
