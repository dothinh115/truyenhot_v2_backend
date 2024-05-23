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
import { ChapterService } from './chapter.service';
import { TQuery } from '@/core/utils/models/query.model';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { RolesGuard } from '@/core/guards/role.guard';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@UseGuards(RolesGuard)
@Controller('chapter')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @Post()
  create(@Body() body: CreateChapterDto, query: TQuery) {
    return this.chapterService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.chapterService.find(query);
  }

  @Patch(':id')
  update(
    @Body() body: UpdateChapterDto,
    @Query() query: TQuery,
    @Param('id') id: number,
  ) {
    return this.chapterService.update(body, query, id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.chapterService.delete(id);
  }
}
