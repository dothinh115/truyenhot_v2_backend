import {
  Controller,
  Body,
  Param,
  Query,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TQuery } from '../utils/model.util';
import { Protected } from '../decorators/protected-route.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateUserDto, @Query() query: TQuery) {
    return this.userService.create(body, query);
  }

  @Get()
  @Protected()
  find(@Query() query: TQuery) {
    return this.userService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Query() query: TQuery,
  ) {
    return this.userService.update(id, body, query);
  }

  @Delete(':id')
  @Protected()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
