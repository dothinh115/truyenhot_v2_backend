import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRole {
  @Prop({ auto: true, input: 'text', disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
  })
  title: string;
  @Prop({ type: mongoose.Schema.Types.String, input: 'text', disabled: true })
  slug: string;
}
