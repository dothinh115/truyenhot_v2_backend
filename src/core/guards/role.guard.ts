import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MethodType, Route } from '../route/entities/route.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExtendedIncomingMessage } from '../utils/model.util';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @InjectRepository(Route) private routeRepo: Repository<Route>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ExtendedIncomingMessage = context.switchToHttp().getRequest();
    //check xem route đang được truy cập có được phân quyền hay ko
    //đối với fastify, req.raw tham chiếu trực tiếp đến InComingMessage, nên gán cho req chính là gán cho raw
    const { url, method, user } = req;
    const routeCacheKey = `route:${url}:${method}`;
    let currentRoute: Route = await this.cacheManager.get<Route>(routeCacheKey);
    if (!currentRoute) {
      currentRoute = await this.routeRepo.findOne({
        where: {
          path: url,
          method: method as MethodType,
        },
      });
      await this.cacheManager.set(routeCacheKey, currentRoute || '', 60000);
    }

    if (currentRoute && currentRoute.isProtected) {
      //nếu route dc protect thì yêu cầu phải có user
      if (!user) throw new UnauthorizedException();
      //nếu là rootUser hoặc role được access thì pass ngay
      if (
        user.rootUser ||
        currentRoute.roles.some((role) => role.id === user.role.id)
      )
        return true;

      //mặc định route dc protect ko dc vượt qua
      return false;
    }
    //nếu route ko dc protect thì mặc định dc vượt qua
    return true;
  }
}
