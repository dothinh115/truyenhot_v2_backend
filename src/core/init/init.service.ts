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
import fs from 'fs';
import path from 'path';
import settings from '../configs/settings.json';
import { EFileType, FileLimit } from '../file-limit/entities/file-limit.entity';
import { EXCLUDED_ROUTE_KEY } from '../decorators/excluded-route.decorator';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private discoveryService: DiscoveryService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Route) private routeRepo: Repository<Route>,
    @InjectRepository(FileLimit) private fileLimitRepo: Repository<FileLimit>,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async onModuleInit() {
    await this.createRoutes();
    await this.createRootUser();
    await this.createPublicDir();
    await this.addMaxFileSize();
  }

  private async createRoutes() {
    let routes: {
      path: string;
      method: MethodType;
      isProtected: boolean;
      isHidden: boolean;
    }[] = [];
    const controllers = this.discoveryService.getControllers();

    for (const controller of controllers) {
      const { instance } = controller;
      if (instance) {
        const controllerPath = this.reflector.get<string>(
          PATH_METADATA,
          instance.constructor,
        );

        const methods = Object.getOwnPropertyNames(
          Object.getPrototypeOf(instance),
        );

        const isExcluded = this.reflector.get<boolean>(
          EXCLUDED_ROUTE_KEY,
          instance.constructor,
        );
        if (isExcluded) continue;
        methods.forEach((methodName) => {
          const methodHandler = instance[methodName];
          const isExcluded = this.reflector.get<boolean>(
            EXCLUDED_ROUTE_KEY,
            methodHandler,
          );

          const methodPath = this.reflector.get<string>(
            PATH_METADATA,
            methodHandler,
          );

          const requestMethod = this.reflector.get<number | undefined>(
            METHOD_METADATA,
            methodHandler,
          );

          const isProtected = this.reflector.get<boolean>(
            PROTECTED_ROUTE_KEY,
            methodHandler,
          );

          const method = RequestMethod[requestMethod] as MethodType;
          if (method) {
            routes.push({
              path: `${controllerPath === '/' ? '' : `/${controllerPath}`}${methodPath === '/' ? '' : `/${methodPath}`}`,
              method,
              isProtected: isProtected ? true : false,
              isHidden: isExcluded ? true : false,
            });
          }
        });
      }
    }

    const createdRoute = [];
    for (const route of routes) {
      const isExists = await this.routeRepo.findOne({
        where: {
          path: route.path,
          method: route.method,
        },
      });
      if (!isExists) {
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

  //tạo public dir nếu chưa có
  private async createPublicDir() {
    const projectPath = process.cwd();
    const publicFolderPath = path.join(projectPath, '/public');
    fs.promises.access(publicFolderPath).catch(() => {
      colorLog('Tạo thành công thư mục public!', 'bgBlue');
      return fs.promises.mkdir(publicFolderPath);
    });
  }

  //tạo các max file size lần đầu
  private async addMaxFileSize() {
    const fileLimitArr = [];
    for (const [fileType, maxSize] of Object.entries(
      settings.FILE_UPLOAD.MAX_ZISE,
    )) {
      const isExists = await this.fileLimitRepo.exists({
        where: {
          fileType: fileType as EFileType,
        },
      });
      if (isExists) continue;
      const create = this.fileLimitRepo.create({
        fileType: fileType as EFileType,
        maxSize,
      });
      fileLimitArr.push(create);
    }

    await this.fileLimitRepo.save(fileLimitArr);

    const existingFileLimit = await this.fileLimitRepo.find();
    const allowedFileLimitType = Object.keys(settings.FILE_UPLOAD.MAX_ZISE);
    const shouldRemovedFizeSize = existingFileLimit.filter(
      (fileLimit) =>
        !allowedFileLimitType.some((key) => key !== fileLimit.fileType),
    );
    if (shouldRemovedFizeSize.length > 0) {
      await this.fileLimitRepo.remove(shouldRemovedFizeSize);
    }
  }
}
