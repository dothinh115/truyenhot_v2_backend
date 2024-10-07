import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
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
import { ResponseModule } from './response/response.module';
import { HttpModule } from '@nestjs/axios';
import { AssetModule } from './asset/asset.module';
import { FileLimitModule } from './file-limit/file-limit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    DatabaseModule,
    UserModule,
    SchemaModule,
    QueryModule,
    CommonModule,
    DiscoveryModule,
    RoleModule,
    RouteModule,
    ResponseModule,
    HttpModule,
    SettingModule,
    AuthModule,
    MeModule,
    FileUploadModule,
    ScheduleModule.forRoot(),
    AssetModule,
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        host: '127.0.0.1',
        port: 6379,
      }),
    }),
    FolderModule,
    FileModule,
    FileLimitModule,
  ],
  providers: [
    InitService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    JwtStrategy,
  ],
  exports: [CacheModule, HttpModule],
})
export class CoreModule {}
