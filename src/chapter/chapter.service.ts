import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { QueryService } from 'src/core/query/query.service';
import { TQuery } from 'src/core/utils/model.util';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter) private chapterRepo: Repository<Chapter>,
    private queryService: QueryService,
  ) {}
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

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.chapterRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, body: UpdateChapterDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.chapterRepo,
        body,
        id,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.queryService.delete({
        repository: this.chapterRepo,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
