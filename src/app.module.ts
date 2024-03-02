import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { QueryModule } from './query/query.module';
import { MeModule } from './me/me.module';
import { MailModule } from './mail/mail.module';
import { PermisionModule } from './permission/permision.module';
import { DiscoveryModule } from '@nestjs/core';
import { StrategyModule } from './strategy/strategy.module';
import { RouteModule } from './route/route.module';
import { SettingModule } from './setting/setting.module';
import globalPlugin from './mongoose/plugin/global.plugin';
import { Connection } from 'mongoose';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { CategoryModule } from './category/category.module';
import { AuthorModule } from './author/author.module';
import { StoryModule } from './story/story.module';
import { StatusModule } from './status/status.module';
import { ChapterModule } from './chapter/chapter.module';

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
    CategoryModule,
    AuthorModule,
    StoryModule,
    StatusModule,
    ChapterModule,
  ],
})
export class AppModule {}
