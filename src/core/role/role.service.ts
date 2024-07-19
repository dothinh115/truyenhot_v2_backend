import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { TQuery } from '../utils/model.util';
import { QueryService } from '../query/query.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateRoleDto, query: TQuery) {
    return await this.queryService.create({
      repository: this.roleRepo,
      body,
      checkIsExists: {
        title: body.title,
      },
      query,
    });
  }

  async find(query: TQuery) {
    return await this.queryService.query({
      repository: this.roleRepo,
      query,
    });
  }

  async update(id: number, body: UpdateRoleDto, query: TQuery) {
    return await this.queryService.update({
      repository: this.roleRepo,
      body,
      id,
      query,
    });
  }

  async remove(id: string) {
    return await this.queryService.delete({
      repository: this.roleRepo,
      id,
    });
  }
}
