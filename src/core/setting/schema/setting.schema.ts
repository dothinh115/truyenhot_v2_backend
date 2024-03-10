import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DefaultSetting } from 'src/core/mongoose/models/setting.model';

export type SettingDocument = HydratedDocument<Setting>;

@Schema()
export class Setting extends DefaultSetting {}

export const SettingSchema = SchemaFactory.createForClass(Setting);
