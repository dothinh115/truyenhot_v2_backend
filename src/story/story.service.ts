import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { TQuery } from 'src/core/utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Story } from './schema/story.schema';
import { Model } from 'mongoose';
import { QueryService } from '../core/main/query.service';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateStoryDto, query: TQuery) {
    const exists = await this.storyModel.findOne({
      title: body.title,
      author: body.author,
    });
    if (exists) throw new BadRequestException('Đã tồn tại truyện này!');
    const result = await this.storyModel.create(body);
    return await this.queryService.handleQuery(
      this.storyModel,
      query,
      result._id,
    );
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.storyModel, query);
  }

  async update(id: number, body: UpdateStoryDto, query: TQuery) {
    const exists = await this.storyModel.findById(id);
    if (!exists) throw new BadRequestException('Truyện này không tồn tại!');
    const result = await this.storyModel.findByIdAndUpdate(id, body);
    return await this.queryService.handleQuery(
      this.storyModel,
      query,
      result._id,
    );
  }

  async remove(id: number) {
    const exists = await this.storyModel.findById(id);
    if (!exists) throw new BadRequestException('Truyện này không tồn tại!');
    await this.storyModel.findByIdAndDelete(id);
    return {
      message: 'Thành công',
    };
  }
}
