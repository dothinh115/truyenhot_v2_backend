import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { TQuery } from 'src/core/utils/model.util';
import { QueryService } from 'src/core/query/query.service';
import { BaseApiService } from 'src/core/services/crud.base';

@Injectable()
export class CategoryService extends BaseApiService<
  CreateCategoryDto,
  UpdateCategoryDto
> {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    protected queryService: QueryService,
  ) {
    super(categoryRepo, queryService);
  }

  async create(body: CreateCategoryDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.categoryRepo,
        body,
        query,
        checkIsExists: {
          title: body.title,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
