import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { TQuery } from 'src/core/utils/model.util';
import { QueryService } from 'src/core/query/query.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private queryService: QueryService,
  ) {}
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

  async find(query: TQuery) {
    return this.queryService.query({
      repository: this.categoryRepo,
      query,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: number, body: UpdateCategoryDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.categoryRepo,
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
        repository: this.categoryRepo,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
