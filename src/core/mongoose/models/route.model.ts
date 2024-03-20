import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultRoute {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true })
  path: string;
  @Prop({ default: [], ref: 'Permission' })
  permission: string[];
}
