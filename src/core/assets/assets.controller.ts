import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import fs from 'fs';
import { Response } from 'express';
import { File } from '@/core/upload/schema/file.schema';

@Controller()
export class AssetsController {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

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

      res.setHeader('Content-Type', exists.mimeType);
      res.setHeader('Content-Disposition', 'inline');
      fs.createReadStream(path).pipe(res);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
