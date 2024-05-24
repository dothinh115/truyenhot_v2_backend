import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SchemaService {
  models = [];
  constructor() {
    this.models = global.models;
  }
  async find(model: string) {
    try {
      const find = this.models.find((x) => x.name === model);
      if (!find) throw new Error('Không có schema này!');
      const result = find.model.schema.obj;
      for (const key in result) {
        result[key] = {
          ...result[key],
          type: find.typeObj[key],
        };
      }
      return { data: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
