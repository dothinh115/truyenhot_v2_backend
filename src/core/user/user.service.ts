import { Injectable } from '@nestjs/common';
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
    return await this.queryService.create({
      repository: this.userRepo,
      body,
      checkIsExists: {
        email: body.email,
      },
      query,
    });
  }

  async find(query: TQuery) {
    return await this.queryService.query({
      repository: this.userRepo,
      query,
    });
  }

  async update(id: string, body: UpdateUserDto, query: TQuery) {
    return this.queryService.update({
      repository: this.userRepo,
      body,
      query,
      id,
    });
  }

  async remove(id: string) {
    return this.queryService.delete({
      repository: this.userRepo,
      id,
    });
  }
}
