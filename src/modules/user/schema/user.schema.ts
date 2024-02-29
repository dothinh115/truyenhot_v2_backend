import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import userPlugin from '../../../middlewares/mongoose/user.middleware';
import DefaultUser from 'src/models/user.model';
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends DefaultUser {}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(userPlugin);
