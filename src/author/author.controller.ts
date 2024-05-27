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
import { AuthorService } from './author.service';
import { RolesGuard } from '@/core/guards/role.guard';
import { CreateAuthorDto } from './dto/create-author.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Fields } from '@/core/decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('author')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Post()
  create(@Fields() body: CreateAuthorDto, @Query() query: TQuery) {
    return this.authorService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.authorService.find(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Query() query: TQuery,
    @Fields() body: UpdateAuthorDto,
  ) {
    return this.authorService.update(id, query, body);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.authorService.delete(id);
  }
}
