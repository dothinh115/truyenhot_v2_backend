import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schema/role.schema';
import { Model } from 'mongoose';
import { TQuery } from 'src/utils/models/query.model';
import { QueryService } from 'src/query/query.service';
import { toSlug } from 'src/utils/functions/function';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private queryService: QueryService,
  ) {}
  async create(payload: CreateRoleDto, query: TQuery) {
    try {
      const { title } = payload;
      const dupCheck = await this.roleModel.findOne({
        title,
      });
      if (dupCheck) throw new BadRequestException('Đã tồn tại role này');
      const data = {
        title,
        slug: toSlug(title),
      };
      const create = await this.roleModel.create(data);
      return await this.queryService.handleQuery(
        this.roleModel,
        query,
        create._id,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.roleModel, query);
  }

  async update(id: string, body: UpdateRoleDto, query: TQuery) {
    try {
      const existCheck = await this.roleModel.findById(id);
      if (!existCheck) throw new BadRequestException('Không tồn tại role này!');
      await this.roleModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(this.roleModel, query, id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existCheck = await this.roleModel.findById(id);
      if (!existCheck) throw new BadRequestException('Không tồn tại role này!');
      return await this.roleModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
