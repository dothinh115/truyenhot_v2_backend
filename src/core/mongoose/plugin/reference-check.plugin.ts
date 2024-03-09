import { Schema } from 'mongoose';
import setting from '../../../settings.json';

export default function referenceCheckPlugin<T>(schema: Schema<T>) {
  schema.pre('findOneAndDelete', async function (next) {
    if (!setting.REFERENCE_CHECK) return next();
    const query = this.getQuery();
    const record = await this.model.findOne(query);
    const allModelNames = this.model.db.modelNames();
    //chạy qua từng model để check
    for (const modelName of allModelNames) {
      if (modelName === this.model.modelName) continue;
      const model = this.model.db.model(modelName);
      const modelSchema: Schema<Document> = model.schema;
      //chạy qua schema của model để check
      for (const field in modelSchema.paths) {
        //nếu field không phải là string thì bỏ qua
        if (modelSchema.path(field).instance !== 'String') continue;
        const exists = await model.findOne({
          [field]: record?._id.toString(),
        });

        //1 trong các field của schema tham chiếu đến record thì lập tức dừng
        if (exists) {
          throw new Error(
            `Record hiện tại đang được tham chiếu đến ở model ${modelName}, vui lòng kiểm tra lại!`,
          );
        }
      }
    }

    next();
  });
}
