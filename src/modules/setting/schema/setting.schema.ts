import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DefaultSetting } from 'src/utils/mongoose/model/setting.model';
export type SettingDocument = HydratedDocument<Setting>;

@Schema()
export class Setting extends DefaultSetting {}

export const SettingSchema = SchemaFactory.createForClass(Setting);
