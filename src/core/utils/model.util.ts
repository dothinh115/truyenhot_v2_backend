import { FastifyRequest } from 'fastify';
import { IncomingMessage } from 'http';
import { User } from '../user/entities/user.entity';

export type TQuery = {
  fields?: string;
  filter?: string;
  limit?: number;
  page?: number;
  meta?: string;
  sort?: string;
};

export interface CustomRequest extends FastifyRequest {
  raw: ExtendedIncomingMessage;
}

export interface ExtendedIncomingMessage extends IncomingMessage {
  user?: User;
}

export type TAssetsQuery = {
  format?: 'png' | 'jpg' | 'jpeg' | 'webp';
  width?: string;
  height?: string;
  cache?: string;
};
