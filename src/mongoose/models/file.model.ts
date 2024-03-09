import { Prop } from '@nestjs/mongoose';

export class DefaultFile {
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
