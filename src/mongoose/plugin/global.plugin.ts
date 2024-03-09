import { Schema } from 'mongoose';
import settings from '../../settings.json';
import settingPlugin from './setting.plugin';
import userPlugin from './user.plugin';
import textSearchPlugin from './text-search.plugin';
import referenceCheckPlugin from './reference-check.plugin';
import { RoleSchema } from 'src/role/schema/role.schema';
import autoSlug from './auto-slug.plugin';
import { SettingSchema } from 'src/setting/schema/setting.schema';
import { UserSchema } from 'src/user/schema/user.schema';
import { FolderSchema } from 'src/upload/schema/folder.schema';

export default function globalPlugin<T>(schema: Schema) {
  //timestamp
  if (settings.TIMESTAMP) schema.set('timestamps', true);

  //versionKey
  if (!settings.VERSION_KEY) schema.set('versionKey', false);

  //tắt strict mode khi có text search
  if (settings.TEXT_SEARCH.length !== 0) schema.set('strict', false);

  //reference check
  schema.plugin(referenceCheckPlugin);

  //text search plugin
  schema.plugin(textSearchPlugin);

  //setting plugin
  if (schema === SettingSchema) SettingSchema.plugin(settingPlugin);

  //role plugin
  if (schema === RoleSchema) RoleSchema.plugin(autoSlug);

  //user plugin
  if (schema === UserSchema) UserSchema.plugin(userPlugin);

  //folder
  if (schema === FolderSchema) FolderSchema.plugin(autoSlug);
}
