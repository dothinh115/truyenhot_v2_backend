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

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.roleRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, body: UpdateRoleDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.roleRepo,
        body,
        id,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      return await this.queryService.delete({
        repository: this.roleRepo,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
