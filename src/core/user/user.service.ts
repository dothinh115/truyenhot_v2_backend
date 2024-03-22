import { Injectable } from '@nestjs/common';
import { DynamicRouteHandler, TMethod } from '../handler/handler.interface';
import { Model } from 'mongoose';
import { CustomRequest } from '../utils/models/request.model';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';

@Injectable()
export class UserService implements DynamicRouteHandler {
  async handleBefore(
    method: TMethod,
    model: Model<User>,
    body?: CreateUserDto,
    id?: string,
    req?: CustomRequest,
  ): Promise<void> {
    if (method === 'POST') {
      const exists = await model.exists({
        email: body.email,
      });
      if (exists) throw new Error('Đã tồn tại email này trong hệ thống!');
    }

    if (method === 'PATCH') {
      const updatingUser = await model.findById(id).select('+rootUser');
      if (updatingUser.rootUser) {
        if (updatingUser._id.toString() !== req.user._id.toString())
          throw new Error('Không có quyền update root user');
      }
    }

    if (method === 'DELETE') {
      const deletingUser = await model.findById(id).select('+rootUser');
      if (deletingUser?.rootUser) throw new Error('Không được xoá root user!');
    }
  }
  async handleAfter(
    method: TMethod,
    model: Model<User>,
    body?: CreateUserDto,
    id?: string | number,
    req?: CustomRequest,
  ): Promise<void> {}
}
