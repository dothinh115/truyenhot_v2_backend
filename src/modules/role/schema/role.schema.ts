import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import rolePlugin from 'src/middlewares/mongoose/role.middleware';
import DefaultRole from 'src/models/role.model';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends DefaultRole {}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.plugin(rolePlugin);
