import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { RolesGuard } from '../guards/role.guard';

@UseGuards(RolesGuard)
@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get(':model')
  find(@Param('model') model: string) {
    return this.schemaService.find(model);
  }
}
