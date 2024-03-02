import { Schema } from 'mongoose';
import { toSlug } from 'src/utils/functions/function';

export default function autoSlug(field: string = 'title') {
  return function <T>(schema: Schema<T>) {
    schema.pre('save', function (next) {
      if (this[field] && typeof this[field] === 'string') {
        this.$set({
          slug: toSlug(this[field] as string),
        });
      }
      next();
    });

    schema.pre('findOneAndUpdate', function (next) {
      const payload = this.getUpdate();
      if (payload[field] && typeof payload[field] === 'string') {
        this.set({
          slug: toSlug(payload[field] as string),
        });
      }
      next();
    });
  };
}
