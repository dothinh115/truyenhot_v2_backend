import { BadRequestException, Injectable } from '@nestjs/common';
import { TQuery } from '../utils/model.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { UpdateRouteDto } from './dto/route-update.dto';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route) private routeRepo: Repository<Route>,
    private queryService: QueryService,
  ) {}

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.routeRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, body: UpdateRouteDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.routeRepo,
        id,
        body,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
