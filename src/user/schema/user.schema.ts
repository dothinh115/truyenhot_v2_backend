import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import DefaultUser from 'src/mongoose/models/user.model';
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends DefaultUser {}

export const UserSchema = SchemaFactory.createForClass(User);
