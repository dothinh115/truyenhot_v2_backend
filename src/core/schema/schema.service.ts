import { Injectable, NotImplementedException } from '@nestjs/common';

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
      const result = find.schema.obj;
      for (const key in result) {
        result[key] = {
          ...result[key],
          type: find.schema?.paths[key]?.instance,
        };
      }
      return { data: result };
    } catch (error) {
      throw new NotImplementedException(error.message);
    }
  }
}
