import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Status } from './schema/status.schema';
import { Model } from 'mongoose';
import { TQuery } from 'src/core/utils/models/query.model';
import { QueryService } from 'src/core/main/services/query.service';

@Injectable()
export class StatusService {
  constructor(
    @InjectModel(Status.name) private statusModel: Model<Status>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateStatusDto, query: TQuery) {
    try {
      const exists = await this.statusModel.findOne({
        title: body.title,
      });
      if (exists) throw new Error('Đã tồn tại status này!');
      const result = await this.statusModel.create({ title: body.title });
      return await this.queryService.handleQuery(
        this.statusModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.statusModel, query);
  }

  async update(id: number, body: UpdateStatusDto, query: TQuery) {
    try {
      const exists = await this.statusModel.findById(id);
      if (!exists) throw new Error('Status này không tồn tại!');
      const result = await this.statusModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.statusModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const exists = await this.statusModel.findById(id);
      if (!exists) throw new Error('Status này không tồn tại!');
      await this.statusModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
