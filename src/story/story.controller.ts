import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { TQuery } from 'src/core/utils/model.util';
import { Protected } from 'src/core/decorators/protected-route.decorator';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateStoryDto, @Query() query: TQuery) {
    return this.storyService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.storyService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateStoryDto,
    @Query() query: TQuery,
  ) {
    return this.storyService.update(+id, body, query);
  }

  @Delete(':id')
  @Protected()
  remove(@Param('id') id: string) {
    return this.storyService.remove(+id);
  }
}
