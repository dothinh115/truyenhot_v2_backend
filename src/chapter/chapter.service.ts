import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chapter } from './schema/chapter.schema';
import { Model } from 'mongoose';
import { TQuery } from 'src/core/utils/models/query.model';
import { QueryService } from 'src/core/main/services/query.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<Chapter>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateChapterDto, query: TQuery) {
    try {
      const exists = await this.chapterModel.findOne({
        story: body.story,
        name: body.name,
      });
      if (exists) throw new Error('Đã tồn tại chapter này!');
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

  async update(id: number, body: UpdateChapterDto, query: TQuery) {
    try {
      const exists = await this.chapterModel.findById(id);
      if (!exists) throw new Error('Không tồn tại chapter này!');
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

  async remove(id: number) {
    try {
      const exists = await this.chapterModel.findById(id);
      if (!exists) throw new Error('Không tồn tại chapter này!');
      await this.chapterModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
