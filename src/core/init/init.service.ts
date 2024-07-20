import { Injectable, OnModuleInit, RequestMethod } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { colorLog } from '../utils/color-console-log.util';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MethodType, Route } from '../route/entities/route.entity';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { PROTECTED_ROUTE_KEY } from '../decorators/protected-route.decorator';
import { getMetadata } from '../utils/metadata.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private discoveryService: DiscoveryService,
    private reflector: Reflector,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Route) private routeRepo: Repository<Route>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createRoutes();
    await this.createRootUser();
    this.createPublicDir();
  }

  private async createRoutes() {
    let routes: any[] = [];
    const controllers = this.discoveryService.getControllers();

    controllers.forEach((controller) => {
      const { instance } = controller;
      if (instance) {
        const controllerPath = getMetadata(PATH_METADATA, instance.constructor);

        const methods = Object.getOwnPropertyNames(
          Object.getPrototypeOf(instance),
        );

        methods.forEach((methodName) => {
          const methodHandler = instance[methodName];

          const methodPath = getMetadata(PATH_METADATA, methodHandler);
          const requestMethod = getMetadata(METHOD_METADATA, methodHandler);

          const isProtected = getMetadata(PROTECTED_ROUTE_KEY, methodHandler);

          const method = RequestMethod[requestMethod];

          if (method) {
            routes.push({
              path: `${controllerPath === '/' ? '' : `/${controllerPath}`}${methodPath === '/' ? '' : `/${methodPath}`}`,
              method: method,
              isProtected: isProtected ? true : false,
            });
          }
        });
      }
    });

    const createdRoute = [];
    for (const route of routes) {
      const isExists = await this.routeRepo.findOne({
        where: {
          path: route.path,
          method: route.method,
        },
      });
      if (isExists) {
        isExists.isProtected = route.isProtected;
        createdRoute.push(isExists);
      } else {
        const newRoute = this.routeRepo.create(route);
        createdRoute.push(newRoute);
      }
    }

    if (createdRoute.length > 0) {
      await this.routeRepo.save(createdRoute);
    }

    await this.clearRemovedRoutes(routes);
  }

  //hàm xoá các route dư thừa
  private async clearRemovedRoutes(
    routes: { path: string; method: MethodType; isProtected: boolean }[],
  ) {
    const existedRoutes = await this.routeRepo.find();
    const shouldRemovedRoutes = existedRoutes.filter(
      (existedRoute) =>
        !routes.some(
          (route) =>
            route.path === existedRoute.path &&
            route.method === existedRoute.method,
        ),
    );

    if (shouldRemovedRoutes.length > 0) {
      const idsToRemove = shouldRemovedRoutes.map((route) => route.id);
      await this.routeRepo.delete(idsToRemove);
    }
  }

  private async createRootUser() {
    const isRootUserExists = await this.userRepo.exists({
      where: {
        rootUser: true,
      },
    });
    if (!isRootUserExists) {
      const rootUser = this.userRepo.create({
        email: this.configService.get('ROOT_USER_EMAIL'),
        password: this.configService.get('ROOT_USER_PASSWORD'),
        rootUser: true,
      });
      await this.userRepo.save(rootUser);
      colorLog('Đã tạo thành công rootUser', 'fgRed');
      colorLog('email: ' + this.configService.get('ROOT_USER_EMAIL'), 'bgBlue');
      colorLog(
        'password: ' + this.configService.get('ROOT_USER_PASSWORD'),
        'bgBlue',
      );
    }
  }

  private createPublicDir() {
    const projectPath = process.cwd();
    const publicFolderPath = path.join(projectPath, '/public');
    const isPublicDirExists = fs.existsSync(publicFolderPath);
    if (!isPublicDirExists) {
      fs.mkdirSync(publicFolderPath);
      colorLog('Tạo thành công thư mục public!', 'bgBlue');
    }
  }
}
