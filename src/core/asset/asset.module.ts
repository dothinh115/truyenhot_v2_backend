import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../file/entities/file.entity';
import { Folder } from '../folder/entities/folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, Folder])],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
