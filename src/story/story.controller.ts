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
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { TQuery } from 'src/utils/models/query.model';
import { TokenRequired } from '../strategy';
import { RolesGuard } from '../guard/roles.guard';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @UseGuards(TokenRequired, RolesGuard)
  @Post()
  create(@Body() body: CreateStoryDto, @Query() query: TQuery) {
    return this.storyService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.storyService.find(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateStoryDto,
    @Query() query: TQuery,
  ) {
    return this.storyService.update(+id, body, query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storyService.remove(+id);
  }
}
