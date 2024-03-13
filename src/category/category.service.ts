import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';
import { TQuery } from '@/core/utils/models/query.model';
import { QueryService } from '@/core/main/services/query.service';

@Injectable()
export class CategoryService {
  constructor(
    private queryService: QueryService,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, query: TQuery) {
    try {
      const result = await this.categoryModel.create(createCategoryDto);
      return await this.queryService.handleQuery(
        this.categoryModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.categoryModel, query);
  }

  async update(id: number, body: UpdateCategoryDto, query: TQuery) {
    try {
      const exists = await this.categoryModel.findById(id);
      if (!exists) throw new Error('Không có thể loại này!');
      const result = await this.categoryModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.categoryModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const exists = await this.categoryModel.findById(id);
      if (!exists) throw new Error('Không có thể loại này!');
      return await this.categoryModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
