import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import DefaultRoute from 'src/mongoose/models/route.model';

export type RouteDocument = HydratedDocument<Route>;

@Schema()
export class Route extends DefaultRoute {}

export const RouteSchema = SchemaFactory.createForClass(Route);
