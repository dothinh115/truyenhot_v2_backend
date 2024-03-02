import { Prop } from '@nestjs/mongoose';

export default class DefaultRoute {
  @Prop({ required: true })
  path: string;
  @Prop({ default: [], ref: 'Permission' })
  permissions: string[];
}
