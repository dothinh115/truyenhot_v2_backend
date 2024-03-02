import { Prop } from '@nestjs/mongoose';

export class DefaultSetting {
  @Prop({ default: null, ref: 'User' })
  rootUser: string;
  @Prop({ default: null, ref: 'Role' })
  defaultRole: string;
}
