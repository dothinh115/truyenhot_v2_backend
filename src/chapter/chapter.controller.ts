import {
  Controller,
  Body,
  Param,
  Query,
  Post,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { TQuery } from 'src/core/utils/model.util';
import { Protected } from 'src/core/decorators/protected-route.decorator';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateChapterDto, @Query() query: TQuery) {
    return this.chapterService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.chapterService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateChapterDto,
    @Query() query: TQuery,
  ) {
    return this.chapterService.update(+id, body, query);
  }

  @Delete(':id')
  @Protected()
  remove(@Param('id') id: string) {
    return this.chapterService.remove(+id);
  }
}
