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
import { CategoryService } from './category.service';
import { RolesGuard } from '@/core/guards/role.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Fields } from '@/core/decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  create(@Fields() body: CreateCategoryDto, @Query() query: TQuery) {
    return this.categoryService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.categoryService.find(query);
  }

  @Patch(':id')
  update(
    @Fields() body: UpdateCategoryDto,
    @Query() query: TQuery,
    @Param('id') id: number,
  ) {
    return this.categoryService.update(body, query, id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.categoryService.delete(id);
  }
}
