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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Protected } from 'src/core/decorators/protected-route.decorator';
import { TQuery } from 'src/core/utils/model.util';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateCategoryDto, @Query() query: TQuery) {
    return this.categoryService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.categoryService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @Query() query: TQuery,
  ) {
    return this.categoryService.update(+id, body, query);
  }

  @Delete(':id')
  @Protected()
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
