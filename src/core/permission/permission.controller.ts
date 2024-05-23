import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TQuery } from '../utils/models/query.model';
import { RolesGuard } from '../guards/role.guard';

@UseGuards(RolesGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  find(@Query() query: TQuery) {
    return this.permissionService.find(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Query() query: TQuery,
  ) {
    return this.permissionService.update(id, updatePermissionDto, query);
  }
}
