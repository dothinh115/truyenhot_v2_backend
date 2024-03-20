import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRefreshToken {
  @Prop({ auto: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true, type: mongoose.Schema.Types.String, ref: 'User' })
  user: string;
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  refreshToken: string;
  @Prop({ default: null, type: mongoose.Schema.Types.String })
  browserId?: string;
}
