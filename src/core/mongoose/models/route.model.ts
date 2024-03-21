import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRoute {
  @Prop({ auto: true, input: 'text', disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  path: string;
  @Prop({
    default: [],
    ref: 'Permission',
    type: mongoose.Schema.Types.Array,
    input: 'array',
    disabled: true,
  })
  permission: string[];
}
