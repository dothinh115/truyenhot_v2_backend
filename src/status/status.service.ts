import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryService } from '@/core/query/query.service';
import { TQuery } from '@/core/utils/models/query.model';
import { CommonService } from '@/core/common/common.service';
import { Status } from './schema/status.schema';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusService {
  constructor(
    @InjectModel(Status.name) private statusModel: Model<Status>,
    private queryService: QueryService,
    private commonService: CommonService,
  ) {}

  async create(body: CreateStatusDto, query: TQuery) {
    try {
      const exist = await this.statusModel.findOne({
        slug: this.commonService.toSlug(body.title),
      });
      if (exist) throw new Error('Đã tồn tại status này trong hệ thống!');
      const result = await this.statusModel.create(body);
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

  async update(body: UpdateStatusDto, query: TQuery, id: number) {
    try {
      const exist = await this.statusModel.findById(id);
      if (!exist) throw new Error('Không có status này trong hệ thống!');
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

  async delete(id: number) {
    try {
      const exist = await this.statusModel.findById(id);
      if (!exist) throw new Error('Không có status này trong hệ thống!');
      await this.statusModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
