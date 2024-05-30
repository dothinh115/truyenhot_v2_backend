import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class DefaultPermission {
  @Prop({
    auto: true,
    disabled: true,
  })
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.String,
    ref: 'Route',
    required: true,
  })
  route: string;
  @Prop({
    type: mongoose.Schema.Types.Array,
    required: true,
    ref: 'Role',
    default: [],
  })
  roles: string[];
}
