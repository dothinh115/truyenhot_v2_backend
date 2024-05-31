import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';
import { QueryService } from '@/core/query/query.service';
import { CommonService } from '@/core/common/common.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private queryService: QueryService,
    private commonService: CommonService,
  ) {}

  async create(body: CreateCategoryDto, query: TQuery) {
    try {
      const exist = await this.categoryModel.findOne({
        slug: this.commonService.toSlug(body.title),
      });
      if (exist) throw new Error('Đã tồn tại thể loại này trong hệ thống!');
      const result = await this.categoryModel.create(body);
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

  async update(body: UpdateCategoryDto, query: TQuery, id: number) {
    try {
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

  async delete(id: number) {
    try {
      await this.categoryModel.findByIdAndDelete(id);
      return {
        message: 'Thành công',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
