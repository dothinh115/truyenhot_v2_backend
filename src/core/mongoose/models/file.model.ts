import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFile {
  @Prop({ auto: true, disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  originalName: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  mimeType: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.Number,
    disabled: true,
  })
  size: number;
  @Prop({
    required: true,
    ref: 'User',
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  user: string;
  @Prop({
    default: null,
    ref: 'Folder',
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  folder: string;
  @Prop({
    require: true,
    type: mongoose.Schema.Types.String,
    disabled: true,
  })
  extension: string;
}
