import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import settings from '@/settings.json';
import fs from 'fs';
import { Route } from '@/core/route/schema/route.schema';
import { Setting } from '@/core/setting/schema/setting.schema';
import { Permission } from '@/core/permission/schema/permission.schema';
import { User } from '@/core/user/schema/user.schema';
import { TRoute } from '@/core/utils/models/route.model';

export class BoostrapService {
  models: { name: string; model: Model<any> }[];
  constructor(
    private adapterHost: HttpAdapterHost,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Route.name) private routeModel: Model<Route>,
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {
    this.models = global.models;
  }
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
            path: routeObj.route.path.includes(':')
              ? routeObj.route.path.split('/:').filter((x) => x !== '')[0]
              : routeObj.route.path,
            method: routeObj.route.stack[0].method,
          };
        }
      })
      .filter((item: any) => item !== undefined);
    parentRoutes = Array.from(parentRoutes);

    //Tạo route cha
    for (const parentRoute of parentRoutes) {
      const exists = await this.routeModel.findOne({
        path: parentRoute,
      });
      if (exists) continue;
      let isContinue = true;
      for (const excluded of settings.EXCLUDED_ROUTE) {
        if (this.getParentRoute(parentRoute) === excluded) {
          isContinue = false;
          break;
        }
      }
      if (!isContinue) continue;
      await this.routeModel.create({
        path: parentRoute,
      });
    }

    //xoá các route cha dư thừa
    const routes = await this.routeModel.find();
    for (const route of routes) {
      if (route.path.includes('/api')) continue;
      const find = parentRoutes.find((x) => x === route.path);
      if (!find) await this.routeModel.findByIdAndDelete(route._id);
    }

    //Tạo permission
    for (const route of existingRoutes) {
      const existCheck = await this.permissionModel.findOne({
        path: route.path,
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
      await this.permissionModel.create(route);
    }

    //add permissions vào route
    const permissions = await this.permissionModel.find();
    for (const permission of permissions) {
      const findParentRoute = await this.routeModel.findOne({
        path: this.getParentRoute(permission.path),
      });
      if (findParentRoute) {
        let permissionSet = new Set(findParentRoute.permission);
        permissionSet.add(permission._id.toString());
        const permissionArr = Array.from(permissionSet);
        await this.routeModel.findByIdAndUpdate(findParentRoute._id, {
          permission: permissionArr,
        });
      }
    }

    //Xoá các route đã cũ
    const savedRoutes = await this.permissionModel.find();
    //xoá lần 1, so với các route đang tồn tại
    for (const savedRoute of savedRoutes) {
      const find = existingRoutes.find(
        (route) =>
          route.path === savedRoute.path && route.method === savedRoute.method,
      );
      for (const excludedRoute of settings.EXCLUDED_ROUTE) {
        if (
          (this.getParentRoute(savedRoute.path) === excludedRoute || !find) &&
          !savedRoute.path.includes('/api')
        )
          await this.permissionModel.findByIdAndDelete(savedRoute._id);
      }
    }
  }

  async createDynamicRouteAndPermission() {
    const routes = await this.routeModel.find();
    // tạo các dynamic route cha
    for (const model of this.models) {
      const find = routes.find((x) => x.path === model.name);
      if (find) continue;
      const path = '/api/' + model.name;
      const exists = routes.find((x) => x.path === path);
      if (exists) continue;
      await this.routeModel.create({
        path,
      });
    }

    //xoá các dynamic route cha dư thừa
    for (const route of routes) {
      if (route.path.includes('/api')) {
        const find = this.models.find((x) => '/api/' + x.name === route.path);
        if (!find) await this.routeModel.findByIdAndDelete(route._id);
      }
    }

    let permissions = await this.permissionModel.find();

    //tạo permistion cho dynamic route
    for (const model of this.models) {
      const find = permissions.find(
        (x) => this.getParentRoute(x.path) === model.name,
      );
      if (find) continue;
      const methods = ['post', 'get', 'patch', 'delete'];
      for (const method of methods) {
        const exists = await this.permissionModel.findOne({
          path: '/api/' + model.name,
          method,
        });
        if (exists) continue;
        await this.permissionModel.create({
          path: '/api/' + model.name,
          method,
        });
      }
    }

    //xoá các dynamic permission dư thừa
    for (const permission of permissions) {
      if (permission.path.includes('/api')) {
        const name = permission.path
          .split('/')
          .filter((x) => x !== '')
          .slice(-1)[0];
        const exists = this.models.find((x) => x.name === name);
        if (!exists)
          await this.permissionModel.findByIdAndDelete(permission._id);
      }
    }

    permissions = await this.permissionModel.find();
    //add dynamic permission vào dynamic route
    for (const permission of permissions) {
      if (permission.path.includes('/api')) {
        const route = await this.routeModel.findOne({
          path: permission.path,
        });
        if (!route) continue;
        const permissionSet = new Set(route.permission);
        permissionSet.add(permission._id.toString());
        await this.routeModel.findByIdAndUpdate(route._id, {
          permission: Array.from(permissionSet),
        });
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
    await this.bootstrapService.createDynamicRouteAndPermission();
    await this.bootstrapService.rootUserCheck();
  }
}
