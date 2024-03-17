import { CustomRequest } from '@/core/utils/models/request.model';
import { Model } from 'mongoose';

export type TMethod = 'POST' | 'GET' | 'PATCH' | 'DELETE';

export interface DynamicRouteHandler {
  handleBefore(
    method: TMethod,
    model: Model<any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void>;
  handleAfter(
    method: TMethod,
    model: Model<any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void>;
}
