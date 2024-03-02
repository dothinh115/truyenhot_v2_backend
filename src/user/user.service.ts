import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { TQuery } from 'src/utils/models/query.model';
import { QueryService } from 'src/query/query.service';
import { CustomRequest } from 'src/utils/models/request.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private queryService: QueryService,
  ) {}
  async create(body: CreateUserDto, query: TQuery) {
    const exists = await this.userModel.exists({
      email: body.email,
    });
    if (exists) throw new BadRequestException('Email đã được dùng!');
    const newUser = await this.userModel.create(body);
    return await this.queryService.handleQuery(
      this.userModel,
      query,
      newUser._id,
    );
  }

  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.userModel, query);
  }

  async update(id: string, body: any, query: TQuery, req: CustomRequest) {
    const exists = await this.userModel.findById(id).select('+rootUser');
    if (!exists) throw new BadRequestException('Không tồn tại user này!');
    const { _id } = req.user;
    if (exists.rootUser && exists._id !== _id)
      throw new BadRequestException('Không thể update rootUser');
    await this.userModel.findByIdAndUpdate(id, body, { _id });
    return await this.queryService.handleQuery(this.userModel, query, id);
  }

  async remove(id: string) {
    const exists = await this.userModel.findById(id).select('+rootUser');
    if (!exists) throw new BadRequestException('Không tồn tại user này!');
    if (exists.rootUser)
      throw new BadRequestException('Không thể xoá root user');
    return await this.userModel.findByIdAndDelete(id);
  }
}
