import { Schema } from 'mongoose';
import settings from '../../settings.json';
import settingPlugin from './setting.plugin';
import rolePlugin from './role.plugin';
import userPlugin from './user.plugin';
import textSearchPlugin from './text-search.plugin';
import referenceCheckPlugin from './reference-check.plugin';

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
  schema.plugin(settingPlugin);

  //role plugin
  schema.plugin(rolePlugin);

  //user plugin
  schema.plugin(userPlugin);
}
