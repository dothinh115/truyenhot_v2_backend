import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdatePermisionDto } from './dto/update-permision.dto';
import { TQuery } from 'src/core/utils/models/query.model';
import { QueryService } from 'src/core/main/services/query.service';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schema/permission.schema';
import { Model } from 'mongoose';

@Injectable()
export class PermisionService {
  constructor(
    private queryService: QueryService,
    @InjectModel(Permission.name) private permissionService: Model<Permission>,
  ) {}

  async find(query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.permissionService, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, body: UpdatePermisionDto, query: TQuery) {
    try {
      const exists = await this.permissionService.findById(id);
      if (!exists) throw new Error('Không tồn tại route này!');
      await this.permissionService.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.permissionService,
        query,
        id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
