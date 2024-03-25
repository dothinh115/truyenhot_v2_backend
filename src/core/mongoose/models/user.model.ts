import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultUser {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  email: string;
  @Prop({
    required: true,
    select: false,
    type: mongoose.Schema.Types.String,
  })
  password: string;
  @Prop({
    default: false,
    type: mongoose.Schema.Types.Boolean,
    disabled: true,
  })
  actived: boolean;
  @Prop({
    type: mongoose.Schema.Types.String,
    ref: 'Role',
    default: null,
  })
  role: string;
  @Prop({
    default: false,
    immutable: true,
    type: mongoose.Schema.Types.Boolean,
    disabled: true,
  })
  rootUser: boolean;
}
