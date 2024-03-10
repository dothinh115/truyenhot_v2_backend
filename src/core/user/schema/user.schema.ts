import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import DefaultUser from 'src/core/mongoose/models/user.model';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends DefaultUser {}

export const UserSchema = SchemaFactory.createForClass(User);
