import { Schema } from 'mongoose';
import settings from '../../../settings.json';

export default function referenceCheckPlugin(schema: Schema) {
  if (!settings.REFERENCE_CHECK) return;
  //kiểm tra xem ref có hợp lệ hay ko trước khi save
  schema.pre('save', async function (next) {
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

  //kiểm tra xem ref có hợp lệ hay ko trước khi update
  schema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
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

  schema.pre(['deleteOne', 'findOneAndDelete'], async function (next) {
    //lấy model name đang được xoá
    const deletingModelName = this.model.modelName;
    //lấy toàn bộ modelName của cả dự án
    const allModelNames = this.model.db.modelNames();
    //tạo ra 1 mảng để chứa toàn bộ những model có ref đến deletingModel
    const refModels: {
      modelName: string;
      fields: string[]; //vì trong 1 model có thể ref nhiều trường đến 1 model khác nên phải là mảng
    }[] = [];
    //chạy qua toàn bộ modelName
    for (const modelName of allModelNames) {
      //tạo ra model của modelName đó
      const modelOfModelName = this.model.db.model(modelName);
      //lấy danh sách path của model này, đây là 1 cái object với key chính là từng field của model
      const pathsOfModel = modelOfModelName.schema.paths;
      //chạy qua từng field để xem có field nào đang ref đến model hiện tại hay ko
      const refFields: string[] = []; //chứa toàn bộ những field nào có ref đến deleting model
      for (const field in pathsOfModel) {
        if (pathsOfModel[field].options.ref === deletingModelName) {
          //ví dụ như có 1 model có field là createdUser và updatedUser đều ref đến User
          refFields.push(field);
        }
      }
      //nếu mảng refFields có phần tử, tức là bên trong model này có field đang ref đến deleting model
      if (refFields.length > 0) {
        //lưu vào bên trong refModels
        const refModel = {
          modelName,
          fields: refFields,
        };
        refModels.push(refModel);
      }
    }
    //ok lúc này chúng ta đã biết model nào và trường nào đang ref đến deletingModel trong mảng refModels
    //lấy query của record đang được xoá
    const query = this.getQuery();
    //tìm toàn bộ thông tin của query này
    const deletingItem: any = await this.model.findOne(query);
    //lúc này đã có dc _id của record bị xoá, tiếp tục tìm xem trong refModels có bất kỳ trường nào tham chiếu đến _id này hay ko
    for (const refModel of refModels) {
      const model = this.model.db.model(refModel.modelName);
      //lúc này phải chạy qua mảng của fields vì có thể có nhiều trường bên trong
      for (const field of refModel.fields) {
        //nếu có bất kỳ field nào đang ref đến _id hiện tại thì phải quăng lỗi ngay
        const exists = await model.findOne({ [field]: deletingItem._id });
        if (exists)
          throw new Error(
            `Record ${deletingItem._id} đang được tham chiếu đến tại _id ${exists._id} của model ${refModel.modelName}`,
          );
      }
    }
    next();
  });
}
