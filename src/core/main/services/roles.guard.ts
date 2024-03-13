import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '@/core/permission/schema/permission.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { route, user } = context.switchToHttp().getRequest();
    if (!user) return true;
    const { role, rootUser } = user;
    if (rootUser) return true;
    const path = route.path;
    let method: string;
    for (const key in route.methods) {
      method = key;
      break;
    }
    const accessCheck = await this.permissionModel.findOne({
      path,
      method,
    });
    for (const access of accessCheck.roles) {
      if (access === role) return true;
    }
    return false;
  }
}
