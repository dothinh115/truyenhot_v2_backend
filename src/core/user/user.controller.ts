import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { TQuery } from '../utils/models/query.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../guards/role.guard';
import { CustomRequest } from '../utils/models/request.model';
import { CreateUserDto } from './dto/create-user.dto';
import { Fields } from '../decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Query() query: TQuery, @Fields(CreateUserDto) body: CreateUserDto) {
    return this.userService.create(query, body);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.userService.find(query);
  }

  @Patch(':id')
  update(
    @Query() query: TQuery,
    @Param('id') id: string,
    @Fields() body: UpdateUserDto,
    @Req() req: CustomRequest,
  ) {
    return this.userService.update(query, id, body, req);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
