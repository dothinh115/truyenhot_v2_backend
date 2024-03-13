import { Schema } from 'mongoose';
import settings from '../../../settings.json';

export default function referenceCheckPlugin(schema: Schema) {
  if (!settings.REFERENCE_CHECK) return;
  schema.pre('save', async function (next) {
    const refFields: {
      field: string;
      refTo: string;
    }[] = [];
    for (const field in this.schema.paths) {
      if (this.schema.paths[field].options.ref) {
        const refField = {
          field,
          refTo: this.schema.paths[field].options.ref,
        };
        refFields.push(refField);
      }
    }
    if (refFields.length > 0) {
      for (const fieldObj of refFields) {
        const model = this.model(fieldObj.refTo);
        const value = this.get(fieldObj.field);
        if (Array.isArray(value) && value.length === 0) continue;
        if (!value) continue;
        const exists = await model.exists({ _id: value });
        if (!exists)
          throw new Error(
            `Giá trị ${value} không tồn tại bên trong ${fieldObj.refTo}`,
          );
      }
    }
    next();
  });

  schema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
    const refFields: {
      field: string;
      refTo: string;
    }[] = [];
    for (const field in this.model.schema.paths) {
      if (this.model.schema.paths[field].options.ref) {
        const refField = {
          field,
          refTo: this.model.schema.paths[field].options.ref,
        };
        refFields.push(refField);
      }
    }
    if (refFields.length > 0) {
      for (const fieldObj of refFields) {
        const model = this.model.db.model(fieldObj.refTo);
        const payload = this.getUpdate();
        const value = payload[fieldObj.field];
        if (Array.isArray(value) && value.length === 0) continue;
        if (!value) continue;
        const exists = await model.exists({ _id: value });
        if (!exists)
          throw new Error(
            `Giá trị ${value} không tồn tại bên trong ${fieldObj.refTo}`,
          );
      }
    }
    next();
  });

  schema.pre(['deleteOne', 'findOneAndDelete'], async function (next) {
    const deletingModelName = this.model.modelName;
    const allModelNames = this.model.db.modelNames();
    const refModels: {
      modelName: string;
      fields: string[];
    }[] = [];
    for (const modelName of allModelNames) {
      const modelOfModelName = this.model.db.model(modelName);
      const pathsOfModel = modelOfModelName.schema.paths;
      const refFields: string[] = [];
      for (const field in pathsOfModel) {
        if (pathsOfModel[field].options.ref === deletingModelName) {
          refFields.push(field);
        }
      }
      if (refFields.length > 0) {
        const refModel = {
          modelName,
          fields: refFields,
        };
        refModels.push(refModel);
      }
    }
    const query = this.getQuery();
    const deletingItem: any = await this.model.findOne(query);
    for (const refModel of refModels) {
      const model = this.model.db.model(refModel.modelName);
      for (const field of refModel.fields) {
        const exists = await model.findOne({ [field]: deletingItem?._id });
        if (exists)
          throw new Error(
            `Record ${deletingItem._id} đang được tham chiếu đến tại _id ${exists._id} của model ${refModel.modelName}`,
          );
      }
    }
    next();
  });
}
