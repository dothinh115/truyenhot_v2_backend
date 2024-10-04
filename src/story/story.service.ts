import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Story } from './entities/story.entity';
import { Repository } from 'typeorm';
import { TQuery } from 'src/core/utils/model.util';
import { QueryService } from 'src/core/query/query.service';
import { BaseApiService } from 'src/core/services/crud.base';

@Injectable()
export class StoryService extends BaseApiService<
  CreateStoryDto,
  UpdateStoryDto
> {
  constructor(
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    protected queryService: QueryService,
  ) {
    super(storyRepo, queryService);
  }
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
      throw new BadRequestException(error.message);
    }
  }
}
