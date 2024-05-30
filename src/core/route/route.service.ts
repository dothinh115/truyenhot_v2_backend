import { BadRequestException, Injectable } from '@nestjs/common';
import { TQuery } from '../utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryService } from '../query/query.service';
import { Route } from './schema/route.schema';

@Injectable()
export class RouteService {
  constructor(
    @InjectModel(Route.name) private routeModel: Model<Route>,
    private queryService: QueryService,
  ) {}
  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.routeModel, query);
  }
}
