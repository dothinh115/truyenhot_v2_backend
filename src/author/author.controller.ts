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
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Protected } from 'src/core/decorators/protected-route.decorator';
import { TQuery } from 'src/core/utils/model.util';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateAuthorDto, @Query() query: TQuery) {
    return this.authorService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.authorService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateAuthorDto,
    @Query() query: TQuery,
  ) {
    return this.authorService.update(+id, body, query);
  }

  @Delete(':id')
  @Protected()
  remove(@Param('id') id: string) {
    return this.authorService.remove(+id);
  }
}
