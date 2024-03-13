import { Controller, Get, Query } from '@nestjs/common';
import { RouteService } from './route.service';
import { TQuery } from '@/core/utils/models/query.model';

@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  find(@Query() query: TQuery) {
    return this.routeService.find(query);
  }
}
