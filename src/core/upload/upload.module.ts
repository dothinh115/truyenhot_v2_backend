import { Global, Module } from '@nestjs/common';
import { FileUploadService } from './upload.service';

@Global()
@Module({
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
