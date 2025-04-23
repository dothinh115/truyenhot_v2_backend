import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Protected } from '../decorators/protected-route.decorator';
import { TQuery } from '../utils/model.util';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateLogDto, @Query() query: TQuery) {
    return this.logsService.create(body, query);
  }

  @Get()
  @Protected()
  find(@Query() query: TQuery) {
    return this.logsService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateLogDto,
    @Query() query: TQuery,
  ) {
    return this.logsService.update(+id, body, query);
  }

  @Delete(':id')
  @Protected()
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}
