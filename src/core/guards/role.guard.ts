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
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { method, route } = req;
    let url: string = route.path
      .split('/')
      .filter((x: string) => x !== '')
      .join('/');

    const cacheKey = `${url}:${method.toLowerCase()}`;

    let currentRoutePermission: any = await this.cacheManager.get(cacheKey);
    if (!currentRoutePermission) {
      currentRoutePermission = await this.permissionModel.findOne({
        path: url,
        method: method.toLowerCase(),
      });
      await this.cacheManager.set(
        cacheKey,
        currentRoutePermission || '',
        60000,
      );
    }

    if (!currentRoutePermission || currentRoutePermission.public) {
      if (req.headers.authorization) {
        const user = await this.extractUser(req);
        if (!user) return true;
        req.user = user;
      }
      return true;
    }
    if (!req.headers.authorization) throw new UnauthorizedException();
    const user = await this.extractUser(req);
    if (!user) throw new UnauthorizedException();
    req.user = user;
    if (user.rootUser) return true;
    for (const role of currentRoutePermission.roles) {
      if (role === user.role) return true;
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
