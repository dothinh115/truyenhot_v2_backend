import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TQuery } from '../utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schema/role.schema';
import { Model } from 'mongoose';
import { QueryService } from '../query/query.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateRoleDto, query: TQuery) {
    try {
      const exist = await this.roleModel.findOne({
        title: body.title,
      });
      if (exist) throw new Error('Role này đã tồn tại trong hệ thống!');
      const result = await this.roleModel.create(body);
      return await this.queryService.handleQuery(
        this.roleModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.roleModel, query);
  }

  async update(id: string, body: UpdateRoleDto, query: TQuery) {
    try {
      const result = await this.roleModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.roleModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      await this.roleModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
