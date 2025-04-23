import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryService } from 'src/core/query/query.service';
import { TQuery } from 'src/core/utils/model.util';
import { BaseApiService } from 'src/core/services/crud.base';

@Injectable()
export class AuthorService extends BaseApiService<
  CreateAuthorDto,
  UpdateAuthorDto
> {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    protected queryService: QueryService,
  ) {
    super(authorRepo, queryService);
  }
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
}
