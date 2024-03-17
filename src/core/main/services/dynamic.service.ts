import { TQuery } from '@/core/utils/models/query.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueryService } from './query.service';
import { DynamicRouteHandlerService } from './dynamic-handler.service';
import { TMethod } from '../interfaces/dynamic-handler.interface';
import { CustomRequest } from '@/core/utils/models/request.model';
import * as fs from 'fs';
import { CommonService } from './common.service';

@Injectable()
export class DynamicService {
  constructor(
    private queryService: QueryService,
    private dynamicRouteHandler: DynamicRouteHandlerService,
    private commonService: CommonService,
  ) {}
  async create(
    body: any,
    query: TQuery,
    model: Model<any>,
    req: CustomRequest,
  ) {
    try {
      const name = req.params.name;
      const method = req.method;
      if (name === 'user') {
        const exists = await model.exists({
          email: body.email,
        });
        if (exists) throw new Error('Đã tồn tại email này trong hệ thống!');
      }
      if (name === 'role') {
        const exists = await model.exists({
          slug: this.commonService.toSlug(body.title),
        });
        if (exists) throw new Error('Đã tồn tại role này!');
      }
      await this.dynamicRouteHandler.handleCondition(
        name,
        method as TMethod,
        model,
        body,
      );

      const result = await model.create(body);
      await this.dynamicRouteHandler.handleAction(
        name,
        method as TMethod,
        model,
        body,
        undefined,
        req,
      );
      return await this.queryService.handleQuery(model, query, result._id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery, model: Model<any>, req: CustomRequest) {
    try {
      const name = req.params.name;
      const method = req.method;
      await this.dynamicRouteHandler.handleCondition(
        name,
        method as TMethod,
        model,
      );
      await this.dynamicRouteHandler.handleAction(
        name,
        method as TMethod,
        model,
      );
      return await this.queryService.handleQuery(model, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(
    id: string | number,
    body: any,
    query: TQuery,
    model: Model<any>,
    req: CustomRequest,
  ) {
    try {
      const name = req.params.name;
      const method = req.method;
      if (name === 'user') {
        const updatingUser = await model.findById(id).select('+rootUser');
        if (updatingUser.rootUser) {
          if (updatingUser._id !== req.user._id)
            throw new Error('Không có quyền update root user');
        }
      }
      await this.dynamicRouteHandler.handleCondition(
        name,
        method as TMethod,
        model,
        body,
        id,
        req,
      );

      const exists = await model.exists({ _id: id });
      if (!exists) throw new Error('Không có record này trong hệ thống!');
      const result = await model.findByIdAndUpdate(id, body);
      await this.dynamicRouteHandler.handleAction(
        name,
        method as TMethod,
        model,
        body,
        id,
        req,
      );
      return await this.queryService.handleQuery(model, query, result._id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string | number, model: Model<any>, req: CustomRequest) {
    try {
      const name = req.params.name;
      const method = req.method;
      if (name === 'user') {
        const deletingUser = await model.findById(id).select('+rootUser');
        if (deletingUser.rootUser) throw new Error('Không được xoá root user!');
      }

      if (name === 'folder') {
        const exists: any = await model.findById(id);
        if (!exists) throw new Error('Folder không tồn tại!');
        const path = `${process.cwd()}/upload/${exists.slug}`;
        //xoá thư mục đồng nghĩa với xoá toàn bộ files trong thư mục đó
        if (fs.existsSync(path)) {
          this.commonService.removeFileOrFolder(path, true);
        }
      }

      if (name === 'file') {
        const exists = await model.findById(id);
        if (!exists) throw new Error('Không tồn tại file này trong db!');
        let path = `${process.cwd()}/upload`;
        if (exists.folder) path += '/' + exists.folder;
        path += '/' + exists._id.toString() + exists.extension;
        if (fs.existsSync(path)) {
          this.commonService.removeFileOrFolder(path);
        } else throw new Error('Không tồn tại file này trong hệ thống!');
      }

      await this.dynamicRouteHandler.handleCondition(
        name,
        method as TMethod,
        model,
        undefined,
        id,
        req,
      );
      const exists = await model.exists({ _id: id });
      if (!exists) throw new Error('Không có record này trong hệ thống!');
      await model.findByIdAndDelete(id);
      await this.dynamicRouteHandler.handleAction(
        name,
        method as TMethod,
        model,
        undefined,
        id,
        req,
      );
      return {
        message: 'Thành công xoá record có id ' + id,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
