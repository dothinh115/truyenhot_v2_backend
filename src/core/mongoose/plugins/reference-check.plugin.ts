import { Schema } from 'mongoose';

export default function referenceCheckPlugin(schema: Schema) {
  schema.pre(['save'], async function (next) {
    //tìm những field nào đang có ref
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
    //chạy qua để check ref xem có tồn tại hay ko
    if (refFields.length > 0) {
      for (const fieldObj of refFields) {
        const model = this.model(fieldObj.refTo);
        const value = this.get(fieldObj.field);
        //nếu giá trị của field là mảng, và mảng rỗng thì next
        if (Array.isArray(value) && value.length === 0) continue;
        //nếu ko phải mảng và value = null hoặc undefined thì cũng next
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

  schema.pre('findOneAndUpdate', async function (next) {
    //tìm những field nào đang có ref
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
    //chạy qua để check ref xem có tồn tại hay ko
    if (refFields.length > 0) {
      for (const fieldObj of refFields) {
        const model = this.model.db.model(fieldObj.refTo);
        const payload = this.getUpdate();
        const value = payload[fieldObj.field];
        //nếu giá trị của field là mảng, và mảng rỗng thì next
        if (Array.isArray(value) && value.length === 0) continue;
        //nếu ko phải mảng và value = null hoặc undefined thì cũng next
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
}
