import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { FileLimitService } from './file-limit.service';
import { UpdateFileLimitDto } from './dto/update-file-limit.dto';
import { TQuery } from '../utils/model.util';
import { Protected } from '../decorators/protected-route.decorator';

@Controller('file-limit')
export class FileLimitController {
  constructor(private readonly fileLimitService: FileLimitService) {}

  @Get()
  @Protected()
  findAll(@Query() query: TQuery) {
    return this.fileLimitService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateFileLimitDto,
    @Query() query: TQuery,
  ) {
    return this.fileLimitService.update(+id, body, query);
  }
}
