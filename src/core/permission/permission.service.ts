import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schema/permission.schema';
import { Model } from 'mongoose';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/models/query.model';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    private queryService: QueryService,
  ) {}
  async create(body: CreatePermissionDto, query: TQuery) {
    try {
      const exist = await this.permissionModel.findOne({
        route: body.route,
        roles: body.roles,
      });
      if (exist) throw new Error('Đã có permission này rồi!');
      const result = await this.permissionModel.create(body);
      return await this.queryService.handleQuery(
        this.permissionModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.permissionModel, query);
  }

  async update(id: string, body: UpdatePermissionDto, query: TQuery) {
    try {
      const exist = await this.permissionModel.findById(id);
      if (!exist) throw new Error('Không tồn tại permission này!');
      const result = await this.permissionModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.permissionModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.permissionModel.findById(id);
      if (!exist) throw new Error('Không tồn tại permission này!');
      await this.permissionModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
