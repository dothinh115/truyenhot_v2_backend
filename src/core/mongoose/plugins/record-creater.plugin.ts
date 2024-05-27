import mongoose, { Schema } from 'mongoose';

export default function recordCreater(schema: Schema) {
  if (!schema.paths['recordCreater']) {
    schema.add({
      recordCreater: {
        type: mongoose.Schema.Types.String,
        select: false,
        ref: 'User',
      },
    });
    schema.index({ recordCreater: 1 });
  }
}
