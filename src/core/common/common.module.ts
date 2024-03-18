import { Global, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { BcryptService } from './bcrypt.service';
import { BoostrapService, OnBootStrapService } from './bootstrap.service';

@Global()
@Module({
  providers: [
    CommonService,
    BcryptService,
    OnBootStrapService,
    BoostrapService,
  ],
  exports: [CommonService, BcryptService, OnBootStrapService],
})
export class CommonModule {}
