import { Injectable } from '@nestjs/common';
import {
  TMethod,
  IDynamicRouteHandler,
} from '../interfaces/dynamic-handler.interface';
import { Model } from 'mongoose';
import { CustomRequest } from '@/core/utils/models/request.model';

@Injectable()
export class DynamicRouteHandlerService implements IDynamicRouteHandler {
  async handleCondition(
    route: string,
    method: TMethod,
    model: Model<any, {}, {}, {}, any, any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {}
  async handleAction(
    route: string,
    method: TMethod,
    model: Model<any, {}, {}, {}, any, any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {}
}
