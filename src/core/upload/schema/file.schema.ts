import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DefaultFile } from '@/core/mongoose/models/file.model';

export type FileDocument = HydratedDocument<File>;

@Schema()
export class File extends DefaultFile {}

export const FileSchema = SchemaFactory.createForClass(File);
