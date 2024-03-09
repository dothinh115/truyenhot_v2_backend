import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/multer/multer.service';

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  providers: [MulterConfigService],
  exports: [MulterModule],
})
export class CustomMulterModule {}
