import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { EFileType, FileLimit } from '../file-limit/entities/file-limit.entity';
import { CustomRequest, TQuery } from '../utils/model.util';
import { File as FileRepo, FileExtension } from '../file/entities/file.entity';
import { QueryService } from '../query/query.service';
import * as path from 'path';
import { Folder } from '../folder/entities/folder.entity';
import * as fs from 'fs';
import crypto from 'crypto';
import { Setting } from '../setting/entities/setting.entity';
import { User } from '../user/entities/user.entity';
@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileLimit) private fileLimit: Repository<FileLimit>,
    @InjectRepository(FileRepo) private fileRepo: Repository<FileRepo>,
    @InjectRepository(Setting) private settingRepo: Repository<Setting>,
    private queryService: QueryService,
  ) {}
  async validate(file: Express.Multer.File) {
    //kiểm tra file type
    const findFileType = await this.fileLimit.findOne({
      where: {
        fileType: file.mimetype as EFileType,
      },
    });
    if (!findFileType) throw new Error(`Không hỗ trợ loại file này!`);
    const setting = await this.settingRepo.find({
      take: 1,
    });

    //kiểm tra duplicate nếu cần
    if (setting[0].duplicateFileCheck) {
      const hash = this.getFileHash(file);
      const hashedFile = await this.fileRepo.findOne({
        where: {
          hash,
        },
      });

      if (hashedFile) {
        const errorData = {
          message: `${file.originalname} đã tồn tại trong hệ thống với id: ${hashedFile.id}`,
          fileId: hashedFile.id,
        };
        throw new Error(JSON.stringify(errorData));
      }
    }

    //kiểm tra file size
    const maxFileSize = findFileType.maxSize * 1024 * 1024; //byte -> Mb

    if (file.size > maxFileSize)
      throw new Error(
        `${file.originalname} đã vượt quá ${findFileType.maxSize} Mb!`,
      );
  }

  async handling(
    file: Express.Multer.File,
    body: any,
    user: User,
    query: TQuery,
    queryRunner: QueryRunner,
  ) {
    const extension = path.extname(file.originalname);
    const fileRepo = queryRunner.manager.getRepository(FileRepo);
    const folderRepo = queryRunner.manager.getRepository(Folder);

    //kiểm tra folder
    let folder: Folder;
    if (body.folder) {
      folder = await folderRepo.findOne({
        where: {
          id: body.folder,
        },
      });
      if (!folder) throw new Error(`Không có folder này!`);
    }

    //lưu vào file vào db để lấy id
    let hash: string | null = null;
    const setting = await this.settingRepo.find({
      take: 1,
    });
    if (setting[0].duplicateFileCheck) {
      //lưu hash nếu cần thiết
      hash = this.getFileHash(file);
    }

    const createdFile = await this.queryService.create({
      repository: fileRepo,
      body: {
        mimeType: file.mimetype as EFileType,
        extension: extension as FileExtension,
        originalName: file.originalname,
        size: file.size,
        user: user.id,
        ...(body.folder && {
          folder: body.folder as any,
        }),
        ...(hash && {
          hash,
        }),
      },
      query,
    });

    const id = createdFile.data.data.id;
    const filePath = path.join(
      process.cwd(),
      '/public',
      folder ? folder.name : '',
      `${id}${extension}`,
    );
    await fs.promises.writeFile(filePath, file.buffer);
    return createdFile;
  }

  getFileHash(file: Express.Multer.File) {
    const fileBuffer = file.buffer;
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
}
