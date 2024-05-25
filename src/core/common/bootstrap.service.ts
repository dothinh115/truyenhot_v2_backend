import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import settings from '@/settings.json';
import fs from 'fs';
import { Setting } from '@/core/setting/schema/setting.schema';
import { User } from '@/core/user/schema/user.schema';
import { TRoute } from '@/core/utils/models/route.model';
import { Permission } from '../permission/schema/permission.schema';

export class BoostrapService {
  constructor(
    private adapterHost: HttpAdapterHost,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {}
  private getParentRoute = (route: string) => {
    return route.split('/').filter((x) => x !== '')[0];
  };

  //Tạo setting object
  async createSetting() {
    const exist = await this.settingModel.findOne();
    if (!exist) {
      await this.settingModel.create({});
      console.log('Tạo thành công setting');
    }
  }

  //Tạo folder upload
  async createUploadFolder() {
    const path = process.cwd() + '/upload';
    if (!fs.existsSync(path)) fs.mkdirSync(path);
  }

  //Hàm check và lưu toàn bộ path trong dự án
  async handlePath() {
    const httpAdapter = this.adapterHost.httpAdapter;
    const server = httpAdapter.getHttpServer();
    const router = server._events.request._router;
    let parentRoutes: any = new Set();
    //lấy toàn bộ route
    const existingRoutes: { path: string; method: string }[] = router.stack
      .map((routeObj: TRoute) => {
        if (routeObj.route) {
          if (routeObj.route.path.includes(':name')) return;
          for (const item of settings.EXCLUDED_ROUTE) {
            if (this.getParentRoute(routeObj.route.path) === item) return;
          }
          const route = this.getParentRoute(routeObj.route.path);
          parentRoutes.add(route);
          return {
            path: routeObj.route.path,
            method: routeObj.route.stack[0].method,
          };
        }
      })
      .filter((item: any) => item !== undefined);
    parentRoutes = Array.from(parentRoutes);
    //Tạo permission
    for (const route of existingRoutes) {
      const existCheck = await this.permissionModel.findOne({
        path: route.path.slice(1),
        method: route.method,
      });
      if (existCheck) continue;
      let isContinue = true;
      for (const excluded of settings.EXCLUDED_ROUTE) {
        if (this.getParentRoute(route.path) === excluded) {
          isContinue = false;
          break;
        }
      }
      if (!isContinue) continue;
      await this.permissionModel.create({
        path: route.path.slice(1),
        method: route.method,
      });
      console.log('Tạo thành công route ' + route.path.slice(1));
    }

    //Xoá các route đã cũ
    const savedRoutes = await this.permissionModel.find();
    //xoá lần 1, so với các route đang tồn tại
    for (const savedRoute of savedRoutes) {
      const find = existingRoutes.find(
        (route) =>
          route.path.slice(1) === savedRoute.path &&
          route.method === savedRoute.method,
      );
      for (const excludedRoute of settings.EXCLUDED_ROUTE) {
        if (this.getParentRoute(savedRoute.path) === excludedRoute || !find)
          await this.permissionModel.findByIdAndDelete(savedRoute._id);
      }
    }
  }

  //Hàm check root_user
  async rootUserCheck() {
    const setting = await this.settingModel.findOne();
    const rootUser = await this.userModel.findOne({ rootUser: true });
    if (setting.rootUser && rootUser) return;
    const created = await this.userModel.create({
      email: this.configService.get('ROOT_USER'),
      password: this.configService.get('ROOT_PASS'),
      actived: true,
      rootUser: true,
    });
    await this.settingModel.findOneAndUpdate({
      rootUser: created._id,
    });
    console.log(
      `Tạo thành công root user\nEmail: ${
        created.email
      }\nPassword: ${this.configService.get('ROOT_PASS')}`,
    );
  }
}

@Injectable()
export class OnBootStrapService implements OnApplicationBootstrap {
  constructor(private bootstrapService: BoostrapService) {}
  async onApplicationBootstrap() {
    await this.bootstrapService.createUploadFolder();
    await this.bootstrapService.createSetting();
    await this.bootstrapService.handlePath();
    await this.bootstrapService.rootUserCheck();
  }
}
