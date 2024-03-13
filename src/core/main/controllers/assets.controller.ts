import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../../upload/schema/file.schema';
import fs from 'fs';
import mime from 'mime';
import { Response } from 'express';
@Controller()
export class AssetsController {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  private getContentType(extension: string): string {
    switch (extension) {
      case '.mp4':
        return 'video/mp4';
      case '.avi':
        return 'video/x-msvideo';
      case '.mov':
        return 'video/quicktime';
      case '.mkv':
        return 'video/x-matroska';
      case '.wmv':
        return 'video/x-ms-wmv';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.bmp':
        return 'image/bmp';
      default:
        return 'application/octet-stream';
    }
  }

  @Get('/assets/:id')
  async get(@Param('id') id: string, @Res() res: Response) {
    try {
      const exists = await this.fileModel.findById(id).populate('folder');
      if (!exists) throw new Error('Không có file này!');
      let path = process.cwd() + '/upload';
      if (exists.folder) path += '/' + (exists.folder as any).slug;
      path += '/' + exists._id.toString();
      path += exists.extension;
      if (!fs.existsSync(path))
        throw new Error('Không tìm thấy file này trong hệ thống');
      const contentType = this.getContentType(exists.extension);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      fs.createReadStream(path).pipe(res);
      return (res as any).sendFile(path);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
