import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRefreshToken {
  @Prop({ auto: true, changeAble: false })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    ref: 'User',
    disabled: true,
  })
  user: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  refreshToken: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  accessToken: string;
}
