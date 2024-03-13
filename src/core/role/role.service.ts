import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schema/role.schema';
import { Model } from 'mongoose';
import { TQuery } from '@/core/utils/models/query.model';
import { QueryService } from '@/core/main/services/query.service';
import { CommonService } from '@/core/main/services/common.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private queryService: QueryService,
    private commonService: CommonService,
  ) {}
  async create(payload: CreateRoleDto, query: TQuery) {
    try {
      const { title } = payload;
      const dupCheck = await this.roleModel.findOne({
        title,
      });
      if (dupCheck) throw new Error('Đã tồn tại role này');
      const data = {
        title,
        slug: this.commonService.toSlug(title),
      };
      const create = await this.roleModel.create(data);
      return await this.queryService.handleQuery(
        this.roleModel,
        query,
        create._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.roleModel, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, body: UpdateRoleDto, query: TQuery) {
    try {
      const existCheck = await this.roleModel.findById(id);
      if (!existCheck) throw new Error('Không tồn tại role này!');
      await this.roleModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(this.roleModel, query, id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existCheck = await this.roleModel.findById(id);
      if (!existCheck) throw new Error('Không tồn tại role này!');
      return await this.roleModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
