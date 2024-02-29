import { Schema } from 'mongoose';
import settings from '../../settings.json';
import { toNonAccented } from 'src/utils/functions/function';

export default function globalPlugin<T>(schema: Schema) {
  if (settings.TIMESTAMP) schema.set('timestamps', true);
  if (!settings.VERSION_KEY) schema.set('versionKey', false);
  if (settings.TEXT_SEARCH.length !== 0) schema.set('strict', false);

  schema.pre('save', async function (next) {
    for (const field of settings.TEXT_SEARCH) {
      if (this.schema.obj[field] !== undefined && this[field] !== undefined) {
        this.$set({
          [`${field}NonAccented`]: toNonAccented(this[field] as string),
        });
      }
    }
    next();
  });

  schema.pre('findOneAndUpdate', async function (next) {
    const payload: any = this.getUpdate();
    for (const field of settings.TEXT_SEARCH) {
      if (payload[field] !== undefined) {
        this.set({
          [`${field}NonAccented`]: toNonAccented(payload[field] as string),
        });
        this.select(`-${field}NonAccented`);
      }
    }
    next();
  });

  schema.pre(['find', 'findOne'], async function (next) {
    for (const field of settings.TEXT_SEARCH) {
      this.select(`-${field}NonAccented`);
    }
    next();
  });
}
