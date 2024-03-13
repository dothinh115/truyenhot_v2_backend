import { BadRequestException, Injectable } from '@nestjs/common';
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
import settings from '../../../settings.json';

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
          try {
            const { folder } = req.params;
            let dir = process.cwd() + '/upload';
            if (folder) {
              const exists = await this.folderModel.findById(folder);
              if (!exists) throw new Error('Folder không tồn tại!');
              dir += `/${exists.slug}`;
            }
            cb(null, dir);
          } catch (error) {
            const err = new BadRequestException(error.message);
            cb(err, null);
          }
        },
        filename: async (req, file: any, cb) => {
          try {
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
          } catch (error) {
            const err = new BadRequestException(error.message);
            cb(err, null);
          }
        },
      }),
      fileFilter(req, file, cb) {
        try {
          if (!settings.UPLOAD.FILE_TYPE.includes(file.mimetype)) {
            throw new Error(`Chỉ chấp nhận file ${settings.UPLOAD.FILE_TYPE}!`);
          }

          cb(null, true);
        } catch (error) {
          const err = new BadRequestException(error.message);
          cb(err, null);
        }
      },
      limits: {
        fileSize: settings.UPLOAD.FILE_SIZE,
      },
    };
  }
}
