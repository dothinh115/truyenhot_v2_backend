import { Model, Schema } from 'mongoose';
global.models = [];

export default function initPlugin(schema: Schema) {
  schema.post('init', function () {
    if (global.models && global.models.length > 0) return;
    const modelNames = this.db.modelNames();
    for (const modelName of modelNames) {
      const model = {
        name: modelName.toLowerCase(),
        model: this.model(modelName),
      };
      global.models.push(model);
    }
  });
}
