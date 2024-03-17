import { Model, Schema } from 'mongoose';
export let models: { name: string; model: Model<any> }[] = [];

export default function initPlugin(schema: Schema) {
  schema.post('init', function () {
    if (models.length > 0) return;
    const modelNames = this.db.modelNames();
    for (const modelName of modelNames) {
      const model = {
        name: modelName.toLowerCase(),
        model: this.model(modelName),
      };
      models.push(model);
    }
  });
}
