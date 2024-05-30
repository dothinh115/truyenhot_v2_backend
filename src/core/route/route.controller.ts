import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { TQuery } from '../utils/models/query.model';
import { RolesGuard } from '../guards/role.guard';

@UseGuards(RolesGuard)
@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  find(@Query() query: TQuery) {
    return this.routeService.find(query);
  }
}
