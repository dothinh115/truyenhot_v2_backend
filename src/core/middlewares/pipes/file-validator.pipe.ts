import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import settings from '../../../settings.json';

export const fileValidator = (): PipeTransform => {
  return new FileValidator();
};
@Injectable()
export class FileValidator implements PipeTransform {
  transform(fileOrFiles: Express.Multer.File | Express.Multer.File[]) {
    if (!fileOrFiles)
      throw new BadRequestException('file không được để trống!');

    if (Array.isArray(fileOrFiles)) {
      for (const file of fileOrFiles) {
        if (file.size > settings.UPLOAD.FILE_SIZE)
          throw new BadRequestException(
            `File size tối đa ${settings.UPLOAD.FILE_SIZE} bytes!`,
          );
        if (!settings.UPLOAD.FILE_TYPE.includes(file.mimetype))
          throw new BadRequestException(
            `Chỉ chấp nhận file ${settings.UPLOAD.FILE_TYPE}!`,
          );
      }
    } else {
      if (fileOrFiles.size > settings.UPLOAD.FILE_SIZE)
        throw new BadRequestException(
          `File size tối đa ${settings.UPLOAD.FILE_SIZE} bytes!`,
        );
      if (!settings.UPLOAD.FILE_TYPE.includes(fileOrFiles.mimetype))
        throw new BadRequestException(
          `Chỉ chấp nhận file ${settings.UPLOAD.FILE_TYPE}!`,
        );
    }

    return fileOrFiles;
  }
}
