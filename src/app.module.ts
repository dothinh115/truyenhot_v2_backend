import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { QueryModule } from './modules/query/query.module';
import { MeModule } from './modules/me/me.module';
import { MailModule } from './modules/mail/mail.module';
import { PermisionModule } from './modules/permission/permision.module';
import { DiscoveryModule } from '@nestjs/core';
import { StrategyModule } from './modules/strategy/strategy.module';
import { RouteModule } from './modules/route/route.module';
import { SettingModule } from './modules/setting/setting.module';
import globalPlugin from './middlewares/mongoose/global.middleware';
import { Connection } from 'mongoose';
import { BootstrapModule } from './modules/bootstrap/bootstrap.module';

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
    AuthModule,
    UserModule,
    RoleModule,
    QueryModule,
    MeModule,
    MailModule,
    PermisionModule,
    DiscoveryModule,
    BootstrapModule,
    StrategyModule,
    RouteModule,
    SettingModule,
  ],
})
export class AppModule {}
