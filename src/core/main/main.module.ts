import { Global, Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { BcryptService } from './services/bcrypt.service';
import {
  BoostrapService,
  OnBootStrapService,
} from './services/bootstrap.service';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './services/multer.service';
import { QueryService } from './services/query.service';
import { AssetsController } from './controllers/assets.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import globalPlugin from '../mongoose/plugins/global.plugin';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { MeModule } from '../me/me.module';
import { MailModule } from '../mail/mail.module';
import { PermisionModule } from '../permission/permision.module';
import { RouteModule } from '../route/route.module';
import { SettingModule } from '../setting/setting.module';
import { UploadModule } from '../upload/upload.module';
import { RolesGuard } from '../guards/roles.guard';
import { DynamicController } from './controllers/dynamic.controller';
import { DynamicService } from './services/dynamic.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    RoleModule,
    MeModule,
    MailModule,
    PermisionModule,
    RouteModule,
    SettingModule,
    UploadModule,
  ],
  controllers: [AssetsController, DynamicController],
  providers: [
    DynamicService,
    CommonService,
    BcryptService,
    OnBootStrapService,
    BoostrapService,
    QueryService,
    RolesGuard,
  ],
  exports: [
    CommonService,
    BcryptService,
    OnBootStrapService,
    MulterModule,
    QueryService,
    ConfigModule,
    MongooseModule,
    AuthModule,
    UserModule,
    RoleModule,
    MeModule,
    MailModule,
    PermisionModule,
    RouteModule,
    SettingModule,
    UploadModule,
    RolesGuard,
    JwtModule,
  ],
})
export class MainModule {}
