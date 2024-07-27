import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SchemaModule } from './schema/schema.module';
import { QueryModule } from './query/query.module';
import { CommonModule } from 'src/core/common/common.module';
import { InitService } from './init/init.service';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { RoleModule } from './role/role.module';
import { RouteModule } from './route/route.module';
import { SettingModule } from './setting/setting.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { FolderModule } from './folder/folder.module';
import { FileModule } from './file/file.module';
import { FileUploadModule } from './upload/upload.module';
import { RoleGuard } from './guards/role.guard';
import { JwtUserExtract } from './guards/jwt-extract.guard';
import { ResponseModule } from './response/response.module';

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
    ResponseModule,
    SettingModule,
    AuthModule,
    MeModule,
    FileUploadModule,
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        host: '127.0.0.1',
        port: 6379,
      }),
    }),
    FolderModule,
    FileModule,
  ],
  providers: [
    InitService,
    {
      provide: APP_GUARD,
      useClass: JwtUserExtract,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [CacheModule],
})
export class CoreModule {}
