import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import rolePlugin from 'src/utils/mongoose/middleware/role.middleware';
import DefaultRole from 'src/utils/mongoose/model/role.model';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends DefaultRole {}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.plugin(rolePlugin);
