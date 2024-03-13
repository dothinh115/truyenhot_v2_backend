import DefaultRefreshToken from '@/core/mongoose/models/refresh-token.model';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema()
export class RefreshToken extends DefaultRefreshToken {}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
