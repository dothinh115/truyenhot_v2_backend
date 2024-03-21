import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRefreshToken {
  @Prop({ auto: true, input: 'text', changeAble: false })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    ref: 'User',
    input: 'text',
    disabled: true,
  })
  user: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  refreshToken: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  accessToken: string;
}
