import { Schema } from 'mongoose';
import settings from '../../../settings.json';
import { CommonService } from 'src/core/main/services/common.service';

export default function textSearchPlugin(schema: Schema) {
  const commonService = new CommonService();
  for (const field of settings.TEXT_SEARCH) {
    if (!schema.path(`${field}NonAccented`) && schema.path(field)) {
      schema.add({
        [`${field}NonAccented`]: {
          type: String,
          select: false,
        },
      });
    }
  }
  //Thêm trường text search
  schema.pre('save', async function (next) {
    for (const field of settings.TEXT_SEARCH) {
      if (this.schema.obj[field] && this[field]) {
        this.$set({
          [`${field}NonAccented`]: commonService.toNonAccented(
            this[field] as string,
          ),
        });
      }
    }
    next();
  });

  //khi update lại trường dc đặt thì cũng phải thay đổi các trường text search
  schema.pre('findOneAndUpdate', async function (next) {
    const payload = this.getUpdate();
    for (const field of settings.TEXT_SEARCH) {
      if (payload[field]) {
        this.set({
          [`${field}NonAccented`]: commonService.toNonAccented(
            payload[field] as string,
          ),
        });
        this.select(`-${field}NonAccented`);
      }
    }
    next();
  });
}
