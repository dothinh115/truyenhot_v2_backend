import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Author } from './schema/author.schema';
import { Model } from 'mongoose';
import { QueryService } from '@/core/main/services/query.service';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(Author.name) private authorModel: Model<Author>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateAuthorDto, query: TQuery) {
    try {
      const exists = await this.authorModel.findOne({
        name: body.name,
      });
      if (exists) throw new Error('Tác giả đã tồn tại!');
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

  async update(id: number, body: UpdateAuthorDto, query: TQuery) {
    try {
      const exists = await this.authorModel.findById(id);
      if (!exists) throw new Error('Không có tác giả này!');
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

  async remove(id: number) {
    try {
      const exists = await this.authorModel.findById(id);
      if (!exists) throw new Error('Không có tác giả này!');
      await this.authorModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
