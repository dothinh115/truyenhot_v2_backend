import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomRequest } from '../utils/model.util';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtUserExtract implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();
    const authorization = req.headers?.authorization;

    let user: User | null = null;
    if (authorization) {
      const token = authorization.split('Bearer ')[1];
      if (token !== 'undefined') {
        try {
          const decoded = await this.jwtService.verifyAsync(token);
          if (decoded.id) {
            user = await this.userRepo.findOneBy({ id: decoded.id });
          }
        } catch (error) {
          if (error.name === 'TokenExpiredError') {
            throw new BadGatewayException('Token đã hết hạn!');
          }
          throw new BadGatewayException(error.message);
        }
      }
    }
    if (user) req.user = user; //đưa thông tin user vào req

    return true;
  }
}