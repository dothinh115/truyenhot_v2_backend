import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chapter } from './schema/chapter.schema';
import { Model } from 'mongoose';
import { QueryService } from '@/core/query/query.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { CommonService } from '@/core/common/common.service';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChapterService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<Chapter>,
    private queryService: QueryService,
    private commonService: CommonService,
  ) {}

  async create(body: CreateChapterDto, query: TQuery) {
    try {
      const exist = await this.chapterModel.findOne({
        story: body.story,
        slug: this.commonService.toSlug(body.name),
      });
      if (exist) throw new Error('Đã tồn tại chapter này trong hệ thống!');
      const result = await this.chapterModel.create(body);

      return await this.queryService.handleQuery(
        this.chapterModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.chapterModel, query);
  }

  async update(body: UpdateChapterDto, query: TQuery, id: number) {
    try {
      const exist = await this.chapterModel.findById(id);
      if (!exist) throw new Error('Không có chapter này trong hệ thống!');
      const result = await this.chapterModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.chapterModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: number) {
    try {
      const exist = await this.chapterModel.findById(id);
      if (!exist) throw new Error('Không có chapter này trong hệ thống!');
      await this.chapterModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
