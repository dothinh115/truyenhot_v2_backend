import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TQuery } from '@/core/utils/models/query.model';
import { RolesGuard } from '@/core/guards/role.guard';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@UseGuards(RolesGuard)
@Controller('status')
export class StatusController {
  constructor(private statusService: StatusService) {}

  @Post()
  create(@Body() body: CreateStatusDto, query: TQuery) {
    return this.statusService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.statusService.find(query);
  }

  @Patch(':id')
  update(
    @Body() body: UpdateStatusDto,
    @Query() query: TQuery,
    @Param('id') id: number,
  ) {
    return this.statusService.update(body, query, id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.statusService.delete(id);
  }
}
