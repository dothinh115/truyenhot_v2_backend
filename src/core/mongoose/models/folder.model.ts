import { Prop } from '@nestjs/mongoose';

export class DefaultFolder {
  @Prop({ required: true })
  title: string;
  @Prop({ unique: true })
  slug: string;
}
