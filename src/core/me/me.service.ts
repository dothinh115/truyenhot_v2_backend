import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateMeDto } from './dto/update-me.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { CustomRequest, TQuery } from '../utils/model.util';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private queryService: QueryService,
  ) {}

  async find(query: TQuery, req: CustomRequest) {
    const reqUser = req.user;
    if (!reqUser) throw new UnauthorizedException();
    return await this.queryService.query({
      repository: this.userRepo,
      query,
      id: reqUser.id,
    });
  }

  async update(body: UpdateMeDto, req: CustomRequest, query: TQuery) {
    try {
      const reqUser = req.user;
      if (!reqUser) throw new UnauthorizedException();
      return await this.queryService.update({
        repository: this.userRepo,
        body,
        id: reqUser.id,
        query,
      });
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
