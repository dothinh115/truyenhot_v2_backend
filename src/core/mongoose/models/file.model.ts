import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFile {
  @Prop({ auto: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  originalName: string;
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  mimeType: string;
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  size: number;
  @Prop({ required: true, ref: 'User', type: mongoose.Schema.Types.String })
  user: string;
  @Prop({ default: null, ref: 'Folder', type: mongoose.Schema.Types.String })
  folder: string;
  @Prop({ require: true, type: mongoose.Schema.Types.String })
  extension: string;
}
