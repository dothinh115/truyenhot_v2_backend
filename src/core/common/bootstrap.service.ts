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
import { Route } from '../route/schema/route.schema';
import Redis from 'ioredis';

export class BoostrapService {
  constructor(
    private adapterHost: HttpAdapterHost,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Route.name) private routeModel: Model<Route>,
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
    //Tạo route
    for (const route of existingRoutes) {
      let isContinue = true;
      for (const excluded of settings.EXCLUDED_ROUTE) {
        if (this.getParentRoute(route.path) === excluded) {
          isContinue = false;
          break;
        }
      }
      if (!isContinue) continue;
      const exist = await this.routeModel.findOne({
        path: route.path,
        method: route.method,
      });
      if (exist) continue;

      await this.routeModel.create({
        path: route.path,
        method: route.method,
      });
      console.log('Tạo thành công route ' + route.path.slice(1));
    }

    //xoá các route dư thừa
    const routes = await this.routeModel.find();
    for (const route of routes) {
      const find = existingRoutes.find(
        (x) => x.method === route.method && x.path === route.path,
      );
      if (!find) await this.routeModel.findByIdAndDelete(route._id);
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
  client;
  constructor(private bootstrapService: BoostrapService) {
    this.client = new Redis({
      host: '127.0.0.1',
      port: 6379,
    });
  }

  async onApplicationBootstrap() {
    const key = 'app:on:bootstrap';
    const value = 'locked';
    const ttl = 60;

    const isLocked = await this.client.set(key, value, 'NX', 'EX', ttl);

    await this.bootstrapService.createUploadFolder();
    await this.bootstrapService.createSetting();

    if (!isLocked) {
      // Nếu không thể đặt khóa, tức là khóa đã tồn tại
      console.log(
        'Bootstrap code has already been executed by another instance.',
      );
    } else await this.bootstrapService.handlePath();

    await this.bootstrapService.rootUserCheck();
  }
}
