import { Module } from '@nestjs/common';
import { DynamicController } from './dynamic.controller';
import { DynamicService } from './dynamic.service';

@Module({
  controllers: [DynamicController],
  providers: [DynamicService],
})
export class DynamicModule {}
