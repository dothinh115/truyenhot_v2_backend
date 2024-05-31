import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Author } from './schema/author.schema';
import { Model } from 'mongoose';
import { QueryService } from '@/core/query/query.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { CommonService } from '@/core/common/common.service';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(Author.name) private authorModel: Model<Author>,
    private queryService: QueryService,
    private commonService: CommonService,
  ) {}

  async create(body: CreateAuthorDto, query: TQuery) {
    try {
      const slug = this.commonService.toSlug(body.name);
      const exist = await this.authorModel.findOne({
        slug,
      });
      if (exist) throw new Error('Đã có tác giả này trong hệ thống!');
      const result = await this.authorModel.create(body);
      return await this.queryService.handleQuery(
        this.authorModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.authorModel, query);
  }

  async update(id: number, query: TQuery, body: UpdateAuthorDto) {
    try {
      const result = await this.authorModel.findByIdAndUpdate(id, body);
      return await this.queryService.handleQuery(
        this.authorModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: number) {
    try {
      await this.authorModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
