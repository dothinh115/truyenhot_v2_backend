import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';
import { QueryService } from '../query/query.service';
import { TQuery } from 'src/utils/models/query.model';

@Injectable()
export class CategoryService {
  constructor(
    private queryService: QueryService,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, query: TQuery) {
    const result = await this.categoryModel.create(createCategoryDto);
    return await this.queryService.handleQuery(
      this.categoryModel,
      query,
      result._id,
    );
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.categoryModel, query);
  }

  async update(id: number, body: UpdateCategoryDto, query: TQuery) {
    const exists = await this.categoryModel.findById(id);
    if (!exists) throw new BadRequestException('Không có thể loại này!');
    const result = await this.categoryModel.findByIdAndUpdate(id, body);
    return await this.queryService.handleQuery(
      this.categoryModel,
      query,
      result._id,
    );
  }

  async remove(id: number) {
    const exists = await this.categoryModel.findById(id);
    if (!exists) throw new BadRequestException('Không có thể loại này!');
    return await this.categoryModel.findByIdAndDelete(id);
  }
}
