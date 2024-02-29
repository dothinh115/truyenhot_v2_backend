import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRefreshToken {
  @Prop({ required: true, type: mongoose.Schema.Types.String, ref: 'User' })
  user: string;
  @Prop({ required: true })
  refreshToken: string;
  @Prop({ default: null })
  browserId?: string;
}
