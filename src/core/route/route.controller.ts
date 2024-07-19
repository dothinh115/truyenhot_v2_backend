import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { RouteService } from './route.service';
import { TQuery } from '../utils/model.util';
import { UpdateRouteDto } from './dto/route-update.dto';
import { Protected } from '../decorators/protected-route.decorator';

@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  find(@Query() query: TQuery) {
    return this.routeService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateRouteDto,
    @Query() query: TQuery,
  ) {
    return this.routeService.update(+id, body, query);
  }
}
