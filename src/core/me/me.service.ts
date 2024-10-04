import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateMeDto } from './dto/update-me.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/model.util';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private queryService: QueryService,
  ) {}

  async find(query: TQuery, user: User) {
    try {
      return await this.queryService.query({
        repository: this.userRepo,
        query,
        id: user.id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(body: UpdateMeDto, reqUser: User, query: TQuery) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id: reqUser.id,
        },
      });
      if (!user) {
        throw new Error('User này không tồn tại!');
      }
      if (user.isEditedUsername && !user.rootUser) {
        throw new Error('Chỉ được chỉnh sửa username 1 lần');
      }
      if (
        'username' in body &&
        body.username &&
        body.username !== user.username
      ) {
        const findIfUsernameExists = await this.userRepo.findOne({
          where: {
            username: body.username,
            id: Not(reqUser.id),
          },
        });
        if (findIfUsernameExists)
          throw new Error('Username này đã được sử dụng!');
        body['isEditedUsername'] = true;
      }

      const updated = await this.queryService.update({
        repository: this.userRepo,
        body,
        id: reqUser.id,
        query,
      });

      return updated;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
