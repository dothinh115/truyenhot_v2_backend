import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Fields } from '../decorator/field.decorator';
import { TQuery } from '../utils/models/query.model';
import { RolesGuard } from '../guards/role.guard';

@UseGuards(RolesGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Fields() body: CreatePermissionDto, @Query() query: TQuery) {
    return this.permissionService.create(body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.permissionService.find(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Fields() body: UpdatePermissionDto,
    @Query() query: TQuery,
  ) {
    return this.permissionService.update(id, body, query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
