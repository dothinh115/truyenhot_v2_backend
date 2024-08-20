import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/model.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateUserDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.userRepo,
        body,
        checkIsExists: {
          email: body.email,
        },
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.userRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, body: UpdateUserDto, query: TQuery) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id,
        },
      });
      if (!user) throw new Error('Không có user này!');

      if ('username' in body && body.username !== user.username) {
        const findIfUsernameExists = await this.userRepo.findOne({
          where: {
            username: body.username,
          },
        });
        if (findIfUsernameExists)
          throw new Error('Username này đã được sử dụng!');
      }
      return await this.queryService.update({
        repository: this.userRepo,
        body,
        query,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      return this.queryService.delete({
        repository: this.userRepo,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
