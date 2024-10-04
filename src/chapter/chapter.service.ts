import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { QueryService } from 'src/core/query/query.service';
import { TQuery } from 'src/core/utils/model.util';
import { BaseApiService } from 'src/core/services/crud.base';

@Injectable()
export class ChapterService extends BaseApiService<
  CreateChapterDto,
  UpdateChapterDto
> {
  constructor(
    @InjectRepository(Chapter) private chapterRepo: Repository<Chapter>,
    protected queryService: QueryService,
  ) {
    super(chapterRepo, queryService);
  }
  async create(body: CreateChapterDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.chapterRepo,
        body,
        query,
        checkIsExists: {
          name: body.name,
          story: body.story,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
