import { Global, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Folder } from '../folder/entities/folder.entity';
import { FileLimit } from '../file-limit/entities/file-limit.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([File, Folder, FileLimit])],
  controllers: [FileController],
  providers: [FileService],
  exports: [TypeOrmModule],
})
export class FileModule {}
