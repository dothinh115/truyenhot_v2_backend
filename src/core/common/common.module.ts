import { Global, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { BcryptService } from './bcrypt.service';

@Global()
@Module({
  providers: [CommonService, BcryptService],
  exports: [CommonService, BcryptService],
})
export class CommonModule {}
