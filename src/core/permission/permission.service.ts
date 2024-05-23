import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TQuery } from '../utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schema/permission.schema';
import { Model } from 'mongoose';
import { QueryService } from '../query/query.service';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    private queryService: QueryService,
  ) {}
  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.permissionModel, query);
  }

  async update(id: string, body: UpdatePermissionDto, query: TQuery) {
    try {
      const exist = await this.permissionModel.findById(id);
      if (!exist) throw new Error('Không có permission này trong hệ thống!');
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
}
