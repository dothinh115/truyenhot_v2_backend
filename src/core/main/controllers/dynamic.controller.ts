import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DynamicService } from '../services/dynamic.service';
import { Model } from 'mongoose';
import { TQuery } from '@/core/utils/models/query.model';
import { CustomRequest } from '@/core/utils/models/request.model';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('api/:name')
export class DynamicController {
  models: { name: string; model: Model<any> }[];
  constructor(private dynamicService: DynamicService) {
    this.models = global.models;
  }

  @UseGuards(RolesGuard)
  @Post()
  create(
    @Param('name') name: string,
    @Body() body: any,
    @Query() query: TQuery,
    @Req() req: CustomRequest,
  ) {
    const model = this.models.find((x) => x.name === name)?.model;
    if (!model)
      throw new BadRequestException(`Không có model ${name} trong hệ thống!`);
    return this.dynamicService.create(body, query, model, req);
  }

  @UseGuards(RolesGuard)
  @Get()
  find(
    @Param('name') name: string,
    @Query() query: TQuery,
    @Req() req: CustomRequest,
  ) {
    const model = this.models.find((x) => x.name === name)?.model;
    if (!model)
      throw new BadRequestException(`Không có model ${name} trong hệ thống!`);
    return this.dynamicService.find(query, model, req);
  }

  @UseGuards(RolesGuard)
  @Patch(':id')
  update(
    @Param('name') name: string,
    @Param('id') id: string | number,
    @Body() body: any,
    @Query() query: TQuery,
    @Req() req: CustomRequest,
  ) {
    const model = this.models.find((x) => x.name === name)?.model;
    if (!model)
      throw new BadRequestException(`Không có model ${name} trong hệ thống!`);
    return this.dynamicService.update(id, body, query, model, req);
  }

  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(
    @Param('name') name: string,
    @Param('id') id: string | number,
    @Req() req: CustomRequest,
  ) {
    const model = this.models.find((x) => x.name === name)?.model;
    if (!model)
      throw new BadRequestException(`Không có model ${name} trong hệ thống!`);
    return this.dynamicService.remove(id, model, req);
  }
}
