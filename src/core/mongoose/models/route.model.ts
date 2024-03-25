import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRoute {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  path: string;
  @Prop({
    default: [],
    ref: 'Permission',
    type: mongoose.Schema.Types.Array,
    disabled: true,
  })
  permission: string[];
}
