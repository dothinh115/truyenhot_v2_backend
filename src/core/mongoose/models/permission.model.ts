import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export default class DefaultPermission {
  @Prop({ required: true })
  path: string;
  @Prop({ required: true })
  method: string;
  @Prop({ type: mongoose.Schema.Types.Array, ref: 'Role' })
  roles: string[];
  @Prop({ default: false })
  public: boolean;
}
