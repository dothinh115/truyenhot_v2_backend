import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TAssetsQuery } from '../utils/model.util';
import { File } from '../file/entities/file.entity';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { FastifyReply } from 'fastify';

@Injectable()
export class AssetService {
  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {}

  async find(id: string, query: TAssetsQuery, res: FastifyReply) {
    try {
      // Kiểm tra xem file có trong database không
      const file = await this.fileRepo.findOne({
        where: { id },
      });
      if (!file) throw new Error('Không có file này trong hệ thống');

      const inputFilePath = file.folder
        ? path.join(
            process.cwd(),
            'public',
            file.folder.name,
            file.id + file.extension,
          )
        : path.join(process.cwd(), 'public', file.id + file.extension);

      const isFileExists = fs.existsSync(inputFilePath);
      if (!isFileExists) throw new Error('File này không tồn tại!');

      //trong trường hợp xử lý ảnh với sharp
      if (query.format || query.height || query.width) {
        //kiểm tra định dạng ảnh
        if (
          !['image/webp', 'image/jpeg', 'image/png'].includes(file.mimeType)
        ) {
          throw new Error('Định dạng này chỉ đuọc sử dụng với ảnh!');
        }
        // Khởi tạo sharp với input file
        let transform = sharp(inputFilePath);

        // Xử lý chiều cao và chiều rộng nếu có
        if (query.width && query.height) {
          transform = transform.resize(+query.width, +query.height);
        } else if (query.width) {
          transform = transform.resize(+query.width);
        } else if (query.height) {
          transform = transform.resize(+query.height);
        }

        // Xử lý định dạng
        if (query.format) {
          const originalName = path.parse(file.originalName).name;
          switch (query.format) {
            case 'webp':
              res.type('image/webp');
              res.header(
                'content-disposition',
                `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${originalName}.webp"`,
              );
              transform = transform.webp();
              break;
            case 'jpg':
            case 'jpeg':
              res.type('image/jpeg');
              res.header(
                'content-disposition',
                `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${originalName}.jpg"`,
              );
              transform = transform.jpeg();
              break;
            case 'png':
              res.type('image/png');
              res.header(
                'content-disposition',
                `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${originalName}.png"`,
              );
              transform = transform.png();
              break;
            default:
              throw new Error('Định dạng không hỗ trợ!');
          }
        } else {
          //đặt content type mặc định
          res.type(file.mimeType);
          res.header(
            'content-disposition',
            `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${file.originalName}"`,
          );
        }

        if (query.cache) {
          // Kiểm tra và đảm bảo query.cache là số dương
          const maxAge = parseInt(query.cache, 10);
          if (!isNaN(maxAge) && maxAge > 0) {
            res.headers({
              'cache-control': `public, max-age=${maxAge}`,
            });
          } else {
            throw new Error('Giá trị cache không hợp lệ');
          }
        }

        // Xử lý lỗi của Sharp
        try {
          const buffer = await transform.toBuffer();
          res.send(buffer);
        } catch (err) {
          if (err.message.includes('Processed image is too large')) {
            throw new BadRequestException('Ảnh quá lớn.');
          } else {
            throw new BadRequestException(err.message);
          }
        }
      } else {
        res.type(file.mimeType);
        if (query.cache) {
          const maxAge = parseInt(query.cache, 10);
          if (!isNaN(maxAge) && maxAge > 0) {
            res.header('cache-control', `public, max-age=${maxAge}`);
          } else {
            throw new Error('Giá trị cache không hợp lệ');
          }
        }

        const readStream = fs.createReadStream(inputFilePath);
        res.header(
          'content-disposition',
          `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${file.originalName}"`,
        );
        res.send(readStream);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
