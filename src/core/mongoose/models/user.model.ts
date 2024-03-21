import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultUser {
  @Prop({ auto: true, input: 'text', disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  email: string;
  @Prop({
    required: true,
    select: false,
    type: mongoose.Schema.Types.String,
    input: 'password',
  })
  password: string;
  @Prop({
    default: false,
    type: mongoose.Schema.Types.Boolean,
    input: 'boolean',
    disabled: true,
  })
  actived: boolean;
  @Prop({
    type: mongoose.Schema.Types.String,
    ref: 'Role',
    default: null,
    input: 'text',
  })
  role: string;
  @Prop({
    default: false,
    immutable: true,
    type: mongoose.Schema.Types.Boolean,
    input: 'boolean',
    disabled: true,
  })
  rootUser: boolean;
}
