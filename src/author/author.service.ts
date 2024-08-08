import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryService } from 'src/core/query/query.service';
import { TQuery } from 'src/core/utils/model.util';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateAuthorDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.authorRepo,
        query,
        body,
        checkIsExists: {
          name: body.name,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.authorRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, body: UpdateAuthorDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.authorRepo,
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
      return this.queryService.delete({
        repository: this.authorRepo,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
