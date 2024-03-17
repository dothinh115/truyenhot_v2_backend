import { DynamicRouteHandler, TMethod } from '@/core/handler/handler.interface';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { CommonService } from './common.service';
import { CustomRequest } from '@/core/utils/models/request.model';
import { Model } from 'mongoose';

@Injectable()
export class FolderService implements DynamicRouteHandler {
  constructor(private commonService: CommonService) {}

  async handleBefore(
    method: TMethod,
    model: Model<any, {}, {}, {}, any, any>,
    body?: any,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {
    if (method === 'DELETE') {
      const exists: any = await model.findById(id);
      if (!exists) throw new Error('Folder không tồn tại!');
      const path = `${process.cwd()}/upload/${exists.slug}`;
      //xoá thư mục đồng nghĩa với xoá toàn bộ files trong thư mục đó
      if (fs.existsSync(path)) {
        this.commonService.removeFileOrFolder(path, true);
      }
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
