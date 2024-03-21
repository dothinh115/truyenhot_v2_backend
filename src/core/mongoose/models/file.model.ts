import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFile {
  @Prop({ auto: true, input: 'text', disabled: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  originalName: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  mimeType: string;
  @Prop({
    required: true,
    type: mongoose.Schema.Types.Number,
    input: 'number',
    disabled: true,
  })
  size: number;
  @Prop({
    required: true,
    ref: 'User',
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  user: string;
  @Prop({
    default: null,
    ref: 'Folder',
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  folder: string;
  @Prop({
    require: true,
    type: mongoose.Schema.Types.String,
    input: 'text',
    disabled: true,
  })
  extension: string;
}
