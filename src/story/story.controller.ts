import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { RolesGuard } from '@/core/guards/role.guard';
import { TQuery } from '@/core/utils/models/query.model';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Fields } from '@/core/decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('story')
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Post()
  create(@Fields() body: CreateStoryDto, query: TQuery) {
    return this.storyService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.storyService.find(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Fields() body: UpdateStoryDto,
    @Query() query: TQuery,
  ) {
    return this.storyService.update(id, body, query);
  }

  @Delete('id')
  delete(@Param('id') id: number) {
    return this.storyService.delete(id);
  }
}
