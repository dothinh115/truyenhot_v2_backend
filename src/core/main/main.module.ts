import { Global, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import globalPlugin from 'src/core/mongoose/plugin/global.plugin';
import { BcryptService } from './bcrypt.service';
import { BoostrapService, OnBootStrapService } from './bootstrap.service';
import { MulterConfigService } from './multer.service';
import { MulterModule } from '@nestjs/platform-express';
import { QueryService } from './query.service';
import { StrategyService } from './strategy.service';
import { RolesGuard } from './roles.guard';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/core/user/user.module';
import { RoleModule } from '../role/role.module';
import { MeModule } from '../me/me.module';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';
import { PermisionModule } from '../permission/permision.module';
import { RouteModule } from '../route/route.module';
import { SettingModule } from '../setting/setting.module';
import { AssetsController } from './assets.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI, {
      dbName: process.env.DB_NAME,
      connectionFactory: async (connection: Connection) => {
        connection.plugin(globalPlugin);
        return connection;
      },
    }),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    AuthModule,
    UserModule,
    RoleModule,
    MeModule,
    MailModule,
    UploadModule,
    PermisionModule,
    RouteModule,
    SettingModule,
  ],
  controllers: [AssetsController],
  providers: [
    CommonService,
    BcryptService,
    OnBootStrapService,
    BoostrapService,
    MulterConfigService,
    QueryService,
    StrategyService,
    RolesGuard,
  ],
  exports: [
    CommonService,
    BcryptService,
    OnBootStrapService,
    MulterConfigService,
    QueryService,
    StrategyService,
    RolesGuard,
    AuthModule,
    UserModule,
    RoleModule,
    MeModule,
    MailModule,
    UploadModule,
    PermisionModule,
    RouteModule,
    SettingModule,
  ],
})
export class MainModule {}
