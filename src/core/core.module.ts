import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchemaModule } from './schema/schema.module';
import { QueryModule } from './query/query.module';
import { CommonModule } from 'src/core/common/common.module';
import { InitService } from './init/init.service';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { RoleModule } from './role/role.module';
import { RouteModule } from './route/route.module';
import { SettingModule } from './setting/setting.module';
import { AuthModule } from './auth/auth.module';
import { GuardModule } from './guards/guard.module';
import { PermissionGuard } from './guards/permission.guard';
import { MeModule } from './me/me.module';
import { UploadModule } from './upload/upload.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    SchemaModule,
    QueryModule,
    CommonModule,
    DiscoveryModule,
    RoleModule,
    RouteModule,
    SettingModule,
    AuthModule,
    GuardModule,
    MeModule,
    UploadModule,
  ],
  providers: [
    InitService,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class CoreModule {}
