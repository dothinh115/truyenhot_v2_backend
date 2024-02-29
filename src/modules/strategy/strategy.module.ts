import { Global, Module } from '@nestjs/common';
import { StrategyService } from './strategy.service';

@Global()
@Module({
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
