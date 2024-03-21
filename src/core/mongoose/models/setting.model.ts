import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultSetting {
  @Prop({ auto: true, input: 'text', disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    default: null,
    ref: 'User',
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  rootUser: string;
  @Prop({
    default: null,
    ref: 'Role',
    type: mongoose.Schema.Types.String,
    input: 'text',
  })
  defaultRole: string;
}
