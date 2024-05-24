import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from '../upload/schema/file.schema';
import { Model } from 'mongoose';
import fs from 'fs';
import { Response } from 'express';
import { TImageQuery } from '../utils/models/query.model';
import sharp from 'sharp';

@Injectable()
export class AssetsService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async get(id: string, res: Response, query: TImageQuery) {
    try {
      const exists = await this.fileModel.findById(id).populate('folder');
      if (!exists) throw new Error('Không có file này!');
      let path = process.cwd() + '/upload';
      if (exists.folder) path += '/' + (exists.folder as any).slug;
      path += '/' + exists._id.toString();
      path += exists.extension;
      if (!fs.existsSync(path))
        throw new Error('Không tìm thấy file này trong hệ thống');

      if ((query.height || query.width) && exists.mimeType === 'image/jpeg') {
        const { height, width } = query;
        const resizedImg = sharp(path).resize(+width, +height);
        if (query.format) {
          const { format } = query;
          switch (format) {
            case 'jpeg':
              resizedImg.jpeg();
              break;
            case 'png':
              resizedImg.png();
              break;
            default:
              resizedImg.webp();
              break;
          }
        } else resizedImg.webp();
        res.setHeader('Content-Type', exists.mimeType);
        res.setHeader('Cache-Control', `public, max-age=3600`); // Set max-age
        res.setHeader('Content-Disposition', 'inline');
        resizedImg.pipe(res);
      } else {
        res.setHeader('Content-Type', exists.mimeType);
        res.setHeader('Cache-Control', `public, max-age=3600`); // Set max-age
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(path).pipe(res);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
