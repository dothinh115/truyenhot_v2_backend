import { Schema } from 'mongoose';
import { toSlug } from 'src/utils/functions/function';

export default function rolePlugin<T>(schema: Schema) {
  schema.pre('save', async function (next) {
    if (this.title) {
      this.slug = toSlug(this.title as string);
    }
    next();
  });

  schema.pre('findOneAndUpdate', async function (next) {
    const payload: any = this.getUpdate();
    if (payload.title !== undefined) {
      this.set({
        slug: toSlug(payload.title as string),
      });
    }
    next();
  });
}
