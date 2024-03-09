import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import mongoose, { Model } from 'mongoose';
import { diskStorage } from 'multer';
import { File } from 'src/core/upload/schema/file.schema';
import { Folder } from 'src/core/upload/schema/folder.schema';
import * as path from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
  ) {}
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const { folder } = req.params;
          let dir = process.cwd() + '/upload';
          if (folder) {
            const exists = await this.folderModel.findById(folder);
            if (!exists) throw new BadRequestException('Folder không tồn tại!');
            dir += `/${exists.slug}`;
          }
          cb(null, dir);
        },
        filename: async (req, file: any, cb) => {
          let newObjectId = new mongoose.Types.ObjectId();
          let exists = await this.fileModel.findById(newObjectId);
          while (exists) {
            newObjectId = new mongoose.Types.ObjectId();
            exists = await this.fileModel.findById(newObjectId);
          }
          const type = path.extname(file.originalname);
          file._id = newObjectId.toString();
          file.extension = type;
          cb(null, `${newObjectId}${type}`);
        },
      }),
    };
  }
}
