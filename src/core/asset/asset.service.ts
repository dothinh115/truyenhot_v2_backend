import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomRequest, TAssetsQuery } from '../utils/model.util';
import { File } from '../file/entities/file.entity';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { FastifyReply } from 'fastify';
import crypto from 'crypto'; // dùng để tạo ETag

@Injectable()
export class AssetService {
  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {}

  async asset(
    id: string,
    query: TAssetsQuery,
    req: CustomRequest,
    res: FastifyReply,
  ) {
    try {
      let result: {
        headers: {
          'content-disposition': string;
          'content-type': string;
          'cache-control': string;
          etag?: string;
          'last-modified'?: string;
        };
        send: Buffer | fs.ReadStream;
      } = {
        headers: {
          'cache-control': '',
          'content-disposition': '',
          'content-type': '',
        },
        send: Buffer.alloc(0),
      };

      const file = await this.fileRepo.findOne({ where: { id } });
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

      // Lấy thời gian sửa đổi cuối cùng của file từ hệ thống tệp
      const fileStats = fs.statSync(inputFilePath);
      const lastModified = fileStats.mtime.toUTCString();
      result.headers['last-modified'] = lastModified;

      // lấy ETag từ nội dung file
      const etag = file.hash;
      result.headers['etag'] = etag;

      // Kiểm tra các tiêu đề If-None-Match (ETag) và If-Modified-Since (Last-Modified) từ yêu cầu
      const ifNoneMatch = req.headers['if-none-match'];
      const ifModifiedSince = req.headers['if-modified-since'];

      // So sánh ETag và Last-Modified, nếu khớp, trả về 304 Not Modified
      if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
        res.header('etag', result.headers['etag']);
        res.header('last-modified', result.headers['last-modified']);
        // Đảm bảo cache-control được thiết lập
        if (query.cache) {
          const maxAge = parseInt(query.cache, 10);
          if (!isNaN(maxAge) && maxAge > 0) {
            res.header('cache-control', `public, max-age=${maxAge}`);
          }
        }
        return res.status(304).send(); // Trả về 304 nếu tài nguyên không thay đổi
      }

      if (query.format || query.height || query.width) {
        // Xử lý ảnh với sharp như bạn đã làm
        let transform = sharp(inputFilePath);

        if (query.width && query.height) {
          transform = transform.resize(+query.width, +query.height);
        } else if (query.width) {
          transform = transform.resize(+query.width);
        } else if (query.height) {
          transform = transform.resize(+query.height);
        }

        if (query.format) {
          const originalName = path.parse(file.originalName).name;
          switch (query.format) {
            case 'webp':
              result.headers['content-type'] = 'image/webp';
              result.headers['content-disposition'] =
                `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${originalName}.webp"`;
              transform = transform.webp();
              break;
            case 'jpg':
            case 'jpeg':
              result.headers['content-type'] = 'image/jpeg';
              result.headers['content-disposition'] =
                `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${originalName}.jpg"`;
              transform = transform.jpeg();
              break;
            case 'png':
              result.headers['content-type'] = 'image/png';
              result.headers['content-disposition'] =
                `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${originalName}.png"`;
              transform = transform.png();
              break;
            default:
              throw new Error('Định dạng không hỗ trợ!');
          }
        } else {
          result.headers['content-type'] = file.mimeType;
          result.headers['content-disposition'] =
            `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${file.originalName}"`;
        }

        const buffer = await transform.toBuffer();
        result.send = buffer;
      } else {
        result.headers['content-type'] = file.mimeType;
        result.headers['content-disposition'] =
          `${query.type && query.type === 'download' ? 'attachment' : 'inline'}; filename="${file.originalName}"`;
        result.send = await fs.promises.readFile(inputFilePath);
      }

      if (query.cache) {
        const maxAge = parseInt(query.cache, 10);
        if (!isNaN(maxAge) && maxAge > 0) {
          result.headers['cache-control'] = `public, max-age=${maxAge}`;
        }
      }

      res.header('etag', result.headers['etag']);
      res.header('last-modified', result.headers['last-modified']);
      res.header('content-disposition', result.headers['content-disposition']);
      res.header('content-type', result.headers['content-type']);
      if (query.cache) {
        res.header('cache-control', result.headers['cache-control']);
      }

      return res.send(result.send);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
