import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { TokenRequired } from '@/core/main/services/strategy.service';
import { RolesGuard } from '@/core/main/services/roles.guard';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @UseGuards(TokenRequired, RolesGuard)
  @Post()
  create(@Body() body: CreateStatusDto, @Query() query: TQuery) {
    return this.statusService.create(body, query);
  }

  @Get()
  findAll(@Query() query: TQuery) {
    return this.statusService.find(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
    @Query() query: TQuery,
  ) {
    return this.statusService.update(+id, body, query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statusService.remove(+id);
  }
}
