import mongoose, { Schema } from 'mongoose';

export default function recordCreater(schema: Schema) {
  if (!schema.paths['record_creater']) {
    schema.add({
      record_creater: {
        type: mongoose.Schema.Types.String,
        select: false,
        ref: 'User',
      },
    });
    schema.index({ record_creater: 1 });
  }
}
