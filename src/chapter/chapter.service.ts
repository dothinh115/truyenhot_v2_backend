import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { TQuery } from 'src/utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Chapter } from './schema/chapter.schema';
import { Model } from 'mongoose';
import { QueryService } from '../query/query.service';
import { Story } from 'src/story/schema/story.schema';

@Injectable()
export class ChapterService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<Chapter>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateChapterDto, query: TQuery) {
    const exists = await this.chapterModel.findOne({
      story: body.story,
      name: body.name,
    });
    if (exists) throw new BadRequestException('Đã tồn tại chapter này!');
    const result = await this.chapterModel.create(body);
    return await this.queryService.handleQuery(
      this.chapterModel,
      query,
      result._id,
    );
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.chapterModel, query);
  }

  async update(id: number, body: UpdateChapterDto, query: TQuery) {
    const exists = await this.chapterModel.findById(id);
    if (!exists) throw new BadRequestException('Không tồn tại chapter này!');
    const result = await this.chapterModel.findByIdAndUpdate(id, body);
    return await this.queryService.handleQuery(
      this.chapterModel,
      query,
      result._id,
    );
  }

  async remove(id: number) {
    const exists = await this.chapterModel.findById(id);
    if (!exists) throw new BadRequestException('Không tồn tại chapter này!');
    await this.chapterModel.findByIdAndDelete(id);
    return {
      message: 'Thành công!',
    };
  }
}
