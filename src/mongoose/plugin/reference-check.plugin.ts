import { Schema } from 'mongoose';
import setting from '../../settings.json';

export default function referenceCheckPlugin<T>(schema: Schema<T>) {
  schema.pre('findOneAndDelete', async function (next) {
    if (!setting.REFERENCE_CHECK) return next();
    const query = this.getQuery();
    const record = await this.model.findOne(query);
    const allModelNames = this.model.db.modelNames();
    const type = typeof record._id;
    //chạy qua từng model để check
    for (const modelName of allModelNames) {
      if (modelName === this.model.modelName) continue;
      // console.log(modelName, this.model.modelName);
      const model = this.model.db.model(modelName);
      const modelSchema: Schema<Document> = model.schema;
      //chạy qua schema của model để check
      for (const field in modelSchema.paths) {
        if (field === '_id') continue;
        //kiểm tra type id của record
        let exists;
        try {
          if (
            type === 'number' &&
            modelSchema.path(field).instance === 'Number'
          ) {
            exists = await model.findOne({
              [field]: record._id,
            });
          } else if (
            type !== 'number' &&
            modelSchema.path(field).instance === 'String'
          ) {
            exists = await model.findOne({
              [field]: record._id.toString(),
            });
          }
        } catch (error) {}
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
