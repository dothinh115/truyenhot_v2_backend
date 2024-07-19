import { Controller, Get, Param } from '@nestjs/common';
import { SchemaService } from './schema.service';

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get(':entityName')
  findOne(@Param('entityName') entityName: string) {
    return this.schemaService.findOne(entityName);
  }
}
