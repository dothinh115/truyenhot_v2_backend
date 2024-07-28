import {
  BadGatewayException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ExtendedIncomingMessage } from '../utils/model.util';

@Injectable()
export class AutoJwtExtractMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}
  async use(
    req: ExtendedIncomingMessage,
    res: FastifyReply['raw'],
    next: (error?: Error | any) => void,
  ) {
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
    next();
  }
}
