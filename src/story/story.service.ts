import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Story } from './entities/story.entity';
import { Repository } from 'typeorm';
import { TQuery } from 'src/core/utils/model.util';
import { QueryService } from 'src/core/query/query.service';

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateStoryDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.storyRepo,
        body,
        query,
        checkIsExists: {
          title: body.title,
          author: body.author,
        },
      });
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.query({ repository: this.storyRepo, query });
  }

  async update(id: number, body: UpdateStoryDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.storyRepo,
        body,
        query,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.queryService.delete({
        id,
        repository: this.storyRepo,
      });
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
