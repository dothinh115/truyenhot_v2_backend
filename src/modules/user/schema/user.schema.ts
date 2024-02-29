import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import userPlugin from '../../../utils/mongoose/middleware/user.middleware';
import DefaultUser from 'src/utils/mongoose/model/user.model';
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends DefaultUser {}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(userPlugin);
