import { Schema } from 'mongoose';
import { CommonService } from '@/core/common/common.service';

export default function autoSlug(
  schema: Schema,
  options: { field: string } | undefined = { field: 'title' },
) {
  let { field } = options;
  const commonService = new CommonService();
  if (!schema.path('slug') && schema.path(field)) {
    schema.add({
      slug: String,
    });
  }

  schema.pre('save', function (next) {
    if (this[field] && typeof this[field] === 'string') {
      this.$set({
        slug: commonService.toSlug(this[field] as string),
      });
    }
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    const payload = this.getUpdate();
    if (
      payload[field] &&
      typeof payload[field] === 'string' &&
      !payload['slug']
    ) {
      this.set({
        slug: commonService.toSlug(payload[field] as string),
      });
    }
    next();
  });
}
