import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFolder {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  title: string;
  @Prop({
    unique: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  slug: string;
}
