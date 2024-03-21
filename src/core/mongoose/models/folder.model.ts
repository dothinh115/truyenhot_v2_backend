import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFolder {
  @Prop({ auto: true, input: 'text', disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  title: string;
  @Prop({
    unique: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  slug: string;
}
