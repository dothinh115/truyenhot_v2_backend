import { Schema } from 'mongoose';

export default function referenceCheckPlugin<T>(schema: Schema<T>) {
  schema.pre('validate', async function (next) {
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
        if (Array.isArray(value) && value.length === 0) return next();
        if (!value) return next();
        const exists = await model.exists({ _id: value });
        if (!exists)
          throw new Error(
            `Giá trị ${value} không tồn tại bên trong ${fieldObj.refTo}`,
          );
      }
    }
    next();
  });
}
