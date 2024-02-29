import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TQuery } from 'src/utils/models/query.model';
import { Route } from './schema/route.schema';
import { Model } from 'mongoose';
import { QueryService } from 'src/modules/query/query.service';

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
