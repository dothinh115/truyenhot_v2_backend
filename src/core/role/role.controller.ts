import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesGuard } from '../guards/role.guard';
import { TQuery } from '../utils/models/query.model';
import { Fields } from '../decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Fields() body: CreateRoleDto, @Query() query: TQuery) {
    return this.roleService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.roleService.find(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Fields() body: UpdateRoleDto,
    @Query() query: TQuery,
  ) {
    return this.roleService.update(id, body, query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
