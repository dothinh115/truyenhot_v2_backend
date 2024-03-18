import { Global, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './schema/folder.schema';
import { File, FileSchema } from './schema/file.schema';
import { HandlerModule } from '../handler/handler.module';
import { FileService } from './file.service';
import { FolderService } from './folder.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Folder.name,
        schema: FolderSchema,
      },
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
    HandlerModule.register([
      {
        route: 'file',
        provider: FileService,
      },
      {
        route: 'folder',
        provider: FolderService,
      },
    ]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [MongooseModule],
})
export class UploadModule {}
