import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { TQuery } from 'src/core/utils/models/query.model';
import { QueryService } from 'src/core/main/services/query.service';
import { CustomRequest } from 'src/core/utils/models/request.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateUserDto, query: TQuery) {
    try {
      const exists = await this.userModel.exists({
        email: body.email,
      });
      if (exists) throw new Error('Email đã được dùng!');
      const newUser = await this.userModel.create(body);
      return await this.queryService.handleQuery(
        this.userModel,
        query,
        newUser._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.userModel, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, body: any, query: TQuery, req: CustomRequest) {
    try {
      const exists = await this.userModel.findById(id).select('+rootUser');
      if (!exists) throw new Error('Không tồn tại user này!');
      const { _id } = req.user;
      if (exists.rootUser && exists._id !== _id)
        throw new Error('Không thể update rootUser');
      await this.userModel.findByIdAndUpdate(id, body, { _id });
      return await this.queryService.handleQuery(this.userModel, query, id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exists = await this.userModel.findById(id).select('+rootUser');
      if (!exists) throw new Error('Không tồn tại user này!');
      if (exists.rootUser) throw new Error('Không thể xoá root user');
      return await this.userModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
