import { DynamicRouteHandler, TMethod } from '@/core/handler/handler.interface';
import { CustomRequest } from '@/core/utils/models/request.model';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import fs from 'fs';
import { CommonService } from './common.service';

@Injectable()
export class FileService implements DynamicRouteHandler {
  constructor(private commonService: CommonService) {}

  async handleBefore(
    method: TMethod,
    model: Model<any, {}, {}, {}, any, any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {
    if (method === 'DELETE') {
      const exists = await model.findById(id);
      if (!exists) throw new Error('Không tồn tại file này trong db!');
      let path = `${process.cwd()}/upload`;
      if (exists.folder) path += '/' + exists.folder;
      path += '/' + exists._id.toString() + exists.extension;
      if (fs.existsSync(path)) {
        this.commonService.removeFileOrFolder(path);
      } else throw new Error('Không tồn tại file này trong hệ thống!');
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
