import { Schema } from 'mongoose';
import settings from '../../settings.json';
import settingPlugin from './setting.plugin';
import rolePlugin from './role.plugin';
import userPlugin from './user.plugin';
import textSearchPlugin from './text-search.plugin';

export default function globalPlugin<T>(schema: Schema) {
  if (settings.TIMESTAMP) schema.set('timestamps', true);
  if (!settings.VERSION_KEY) schema.set('versionKey', false);
  if (settings.TEXT_SEARCH.length !== 0) schema.set('strict', false);

  //text search plugin
  schema.plugin(textSearchPlugin);

  //setting plugin
  schema.plugin(settingPlugin);

  //role plugin
  schema.plugin(rolePlugin);

  //user plugin
  schema.plugin(userPlugin);
}
