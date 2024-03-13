import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/core/user/schema/user.schema';
import { Model } from 'mongoose';
import { QueryService } from '@/core/main/services/query.service';
import { TQuery } from '@/core/utils/models/query.model';

@Injectable()
export class MeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private queryService: QueryService,
  ) {}

  async find(_id: string, query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.userModel, query, _id);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
