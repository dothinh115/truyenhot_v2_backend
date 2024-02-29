import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import DefaultRefreshToken from 'src/models/refresh-token.model';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema()
export class RefreshToken extends DefaultRefreshToken {}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
