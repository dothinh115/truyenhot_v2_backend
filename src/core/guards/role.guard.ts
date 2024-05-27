import { User } from '@/core/user/schema/user.schema';
import {
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
import { Permission } from '../permission/schema/permission.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RolesGuard implements CanActivate {
  models = [];
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.models = global.models;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { method, route } = req;

    //xác định route nào đang dc gọi
    let url: string = route.path
      .split('/')
      .filter((x: string) => x !== '')
      .join('/');

    //đặt cacheKey để lưu vào redis
    const cacheKey = `${url}:${method.toLowerCase()}`;

    //lấy data từ redis
    let currentRoutePermission: any = await this.cacheManager.get(cacheKey);

    //nếu redis ko có thì lấy từ db
    if (!currentRoutePermission) {
      currentRoutePermission = await this.permissionModel.findOne({
        path: url,
        method: method.toLowerCase(),
      });
      //sau khi lấy xong lưu vào redis
      await this.cacheManager.set(
        cacheKey,
        currentRoutePermission || '',
        60000,
      );
    }

    //nếu route ko dc phân quyền, hoặc route public thì pass
    if (!currentRoutePermission || currentRoutePermission.public) {
      //extract user vào req
      if (req.headers.authorization) {
        const user = await this.extractUser(req);
        if (!user) return true;
        req.user = user;
      }
      return true;
    }

    //nếu route dc phân quyền, nhưng ko có token, quăng lỗi
    if (!req.headers.authorization) throw new UnauthorizedException();
    //nếu có token, tiến hành extract User
    const user = await this.extractUser(req);
    //ko có user, quăng lỗi
    if (!user) throw new UnauthorizedException();
    //set user vào req
    req.user = user;

    //nếu là post, cần phải set record_creater để lưu lại user nào vừa tạo ra record này
    if (method.toLowerCase() === 'post') {
      req.body = {
        ...req.body,
        record_creater: user._id,
      };
    } else if (
      method.toLowerCase() === 'patch' ||
      method.toLowerCase() === 'delete'
    ) {
      //dùng regex lấy ra route đang gọi tới, ví dụ role/:id thì => role

      const match = url.match(/^[a-z]+[^\/]/);
      if (!match) {
        return false;
      }
      const name = match[0];
      const model = this.models.find((x) => x.name === name)?.model;
      if (model && req.params.id) {
        const exist = await model
          .findById(req.params.id)
          .select('+record_creater');
        if (
          exist.record_creater !== user._id &&
          !currentRoutePermission.moderators.includes(user.role) &&
          !user.rootUser
        )
          return false;
      }
    }

    // nếu là rootUser, pass ngay
    if (user.rootUser) return true;

    //check xem role hiện tại của user có quyền truy cập vào api hay ko
    if (currentRoutePermission.roles.includes(user.role)) return true;
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
