import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultSetting {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    default: null,
    ref: 'User',
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  rootUser: string;
  @Prop({
    default: null,
    ref: 'Role',
    type: mongoose.Schema.Types.String,
  })
  defaultRole: string;
}
