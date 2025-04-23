import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { TQuery } from '../utils/model.util';
import { QueryService } from '../query/query.service';
import { BaseApiService } from '../services/crud.base';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService extends BaseApiService<CreateRoleDto, UpdateRoleDto> {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    protected queryService: QueryService,
  ) {
    super(roleRepo, queryService);
  }
  async create(body: CreateRoleDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.roleRepo,
        body,
        checkIsExists: {
          title: body.title,
        },
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
