import { Schema } from 'mongoose';
global.models = [];

export default function initPlugin(schema: Schema) {
  schema.post('init', function () {
    if (global.models && global.models.length > 0) return;
    const modelNames = this.db.modelNames();
    for (const modelName of modelNames) {
      const typeObj = {};
      for (const key in this.model(modelName).schema.obj) {
        typeObj[key] = this.model(modelName).schema.obj[key].type?.schemaName;
      }
      const model = {
        name: modelName.toLowerCase(),
        model: this.model(modelName),
        typeObj,
      };
      console.log(model);
      global.models.push(model);
    }
  });
}
