import { Global, Logger, Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logs } from './entities/log.entity';
import { MyLogger } from './logger';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Logs])],
  controllers: [LogsController],
  providers: [
    LogsService,
    MyLogger,
    {
      provide: Logger,
      useClass: MyLogger,
    },
  ],
  exports: [MyLogger],
})
export class LogsModule {}
