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
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { TQuery } from 'src/core/utils/models/query.model';
import { RolesGuard } from 'src/core/main/roles.guard';
import { TokenRequired } from 'src/core/main/strategy.service';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @UseGuards(TokenRequired, RolesGuard)
  @Post()
  create(@Body() body: CreateAuthorDto, @Query() query: TQuery) {
    return this.authorService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.authorService.find(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateAuthorDto,
    @Query() query: TQuery,
  ) {
    return this.authorService.update(+id, body, query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorService.remove(+id);
  }
}
