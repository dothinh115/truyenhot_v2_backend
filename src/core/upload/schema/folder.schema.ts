import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DefaultFolder } from '@/core/mongoose/models/folder.model';

export type FolderDocument = HydratedDocument<Folder>;

@Schema()
export class Folder extends DefaultFolder {}

export const FolderSchema = SchemaFactory.createForClass(Folder);
