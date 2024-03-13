import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Story } from './schema/story.schema';
import { Model } from 'mongoose';
import { TQuery } from '@/core/utils/models/query.model';
import { QueryService } from '@/core/main/services/query.service';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateStoryDto, query: TQuery) {
    try {
      const exists = await this.storyModel.findOne({
        title: body.title,
        author: body.author,
      });
      if (exists) throw new Error('Đã tồn tại truyện này!');
      const result = await this.storyModel.create(body);
      return await this.queryService.handleQuery(
        this.storyModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.storyModel, query);
  }

  async update(id: number, body: UpdateStoryDto, query: TQuery) {
    try {
      const exists = await this.storyModel.findById(id);
      if (!exists) throw new Error('Truyện này không tồn tại!');
      const result = await this.storyModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.storyModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const exists = await this.storyModel.findById(id);
      if (!exists) throw new Error('Truyện này không tồn tại!');
      await this.storyModel.findByIdAndDelete(id);
      return {
        message: 'Thành công',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
