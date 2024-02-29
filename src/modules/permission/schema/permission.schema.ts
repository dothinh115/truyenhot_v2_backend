import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import DefaultPermission from 'src/utils/mongoose/model/permission.model';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema()
export class Permission extends DefaultPermission {}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
