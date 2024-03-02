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
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TQuery } from 'src/utils/models/query.model';
import { TokenRequired } from 'src/strategy';
import { RolesGuard } from 'src/guard/roles.guard';
import { CustomRequest } from 'src/utils/models/request.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(TokenRequired, RolesGuard)
  @Post()
  create(@Body() payload: CreateUserDto, @Query() query: TQuery) {
    try {
      return this.userService.create(payload, query);
    } catch (error) {
      return error;
    }
  }

  @UseGuards(RolesGuard)
  @Get()
  find(@Query() query: TQuery) {
    return this.userService.find(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Query() query: TQuery,
    @Req() req: CustomRequest,
  ) {
    return this.userService.update(id, body, query, req);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
