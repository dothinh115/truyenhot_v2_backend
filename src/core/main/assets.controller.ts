import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../upload/schema/file.schema';

@Controller()
export class AssetsController {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  @Get('/assets/:id')
  async get(@Param('id') id: string, @Res() res: Response) {
    const exists: any = await this.fileModel.findById(id).populate('folder');
    if (!exists) throw new BadRequestException('Không có file này!');
    let path = process.cwd() + '/upload';
    if (exists.folder) path += '/' + exists.folder.slug;
    path += '/' + exists._id.toString();
    path += exists.extension;
    return (res as any).sendFile(path);
  }
}
