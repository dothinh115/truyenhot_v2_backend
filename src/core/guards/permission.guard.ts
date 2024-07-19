import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from '../route/entities/route.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @InjectRepository(Route) private routeRepo: Repository<Route>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    //check xem route đang được truy cập có được phân quyền hay ko
    const { url, method } = req;

    const currentRoute = await this.routeRepo.findOne({
      where: {
        path: url,
        method: method,
      },
    });
    //tiến hành lấy thông tin user nếu có
    const token = req.headers?.authorization?.split('Bearer ')[1];
    let user: User | null = null;
    if (token) {
      try {
        user = await this.getUserFromToken(token);
      } catch (error) {}
      if (user) req.user = user; //đưa thông tin user vào req
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

  async getUserFromToken(token: string) {
    const decoded = await this.jwtService.verifyAsync(token);
    if (decoded.id) {
      const user = await this.userRepo.findOneBy({ id: decoded.id });
      return user;
    }
  }
}
