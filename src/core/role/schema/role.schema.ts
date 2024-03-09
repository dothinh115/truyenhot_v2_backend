import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import DefaultRole from 'src/core/mongoose/models/role.model';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends DefaultRole {}

export const RoleSchema = SchemaFactory.createForClass(Role);
