import { CustomRequest } from '@/core/utils/models/request.model';
import { Model } from 'mongoose';

export type TMethod = 'POST' | 'GET' | 'PATCH' | 'DELETE';

export interface IDynamicRouteHandler {
  handleCondition(
    route: string,
    method: TMethod,
    model: Model<any>,
    body?: any,
    id?: string,
    req?: CustomRequest,
  ): Promise<void>;
  handleAction(
    route: string,
    method: TMethod,
    model: Model<any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void>;
}
