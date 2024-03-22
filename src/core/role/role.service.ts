import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CustomRequest } from '../utils/models/request.model';
import { DynamicRouteHandler, TMethod } from '../handler/handler.interface';
import { CommonService } from '../common/common.service';
import { toSlug } from '../utils/function';

@Injectable()
export class RoleService implements DynamicRouteHandler {
  async handleBefore(
    method: TMethod,
    model: Model<any, {}, {}, {}, any, any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {
    if (method === 'POST') {
      const exists = await model.exists({
        slug: toSlug(body?.title),
      });
      if (exists) throw new Error('Đã tồn tại role này!');
    }
  }

  async handleAfter(
    method: TMethod,
    model: Model<any, {}, {}, {}, any, any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {}
}
