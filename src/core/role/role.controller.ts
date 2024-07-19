import {
  Controller,
  Get,
  Body,
  Param,
  Query,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TQuery } from '../utils/model.util';
import { Protected } from '../decorators/protected-route.decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Protected()
  create(@Body() body: CreateRoleDto, @Query() query: TQuery) {
    return this.roleService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.roleService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @Query() query: TQuery,
  ) {
    return this.roleService.update(+id, body, query);
  }

  @Delete(':id')
  @Protected()
  async remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
