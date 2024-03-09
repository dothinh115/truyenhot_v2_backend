import { Prop } from '@nestjs/mongoose';

export default class DefaultRole {
  @Prop({ required: true })
  title: string;
  @Prop()
  slug: string;
}
