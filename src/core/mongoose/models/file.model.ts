import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class DefaultFile {
  @Prop({ auto: true })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true })
  originalName: string;
  @Prop({ required: true })
  mimeType: string;
  @Prop({ required: true })
  size: number;
  @Prop({ required: true, ref: 'User' })
  user: string;
  @Prop({ default: null, ref: 'Folder' })
  folder: string;
  @Prop({ require: true })
  extension: string;
}
