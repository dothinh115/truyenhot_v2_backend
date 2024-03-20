import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SchemaService {
  models = [];
  constructor() {
    this.models = global.models;
  }
  async find(model: string) {
    try {
      const find = this.models.find((x) => x.name === model)?.model;
      if (!find) throw new Error('Không có schema này!');
      return find.schema.obj;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
