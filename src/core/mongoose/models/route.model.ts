import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultRoute {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  path: string;
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    disabled: true,
  })
  method: string;
}
