import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Story } from './schema/story.schema';
import { Model } from 'mongoose';
import { TQuery } from '@/core/utils/models/query.model';
import { QueryService } from '@/core/query/query.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    private queryService: QueryService,
  ) {}

  async create(body: CreateStoryDto, query: TQuery) {
    try {
      const exist = await this.storyModel.findOne({
        title: body.title,
        author: body.author,
      });
      if (exist) throw new Error('Truyện này đã tồn tại trong hệ thống!');
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
      const exist = await this.storyModel.findById(id);
      if (!exist) throw new Error('Không có truyện này trong hệ thống!');
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

  async delete(id: number) {
    try {
      const exist = await this.storyModel.findById(id);
      if (!exist) throw new Error('Không có truyện này trong hệ thống!');
      await this.storyModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
