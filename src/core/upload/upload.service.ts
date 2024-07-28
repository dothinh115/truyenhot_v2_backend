import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { EFileType, FileLimit } from '../file/entities/file-limit.entity';
import { CustomRequest, TQuery } from '../utils/model.util';
import { File, FileExtension } from '../file/entities/file.entity';
import { QueryService } from '../query/query.service';
import * as path from 'path';
import { Folder } from '../folder/entities/folder.entity';
import * as fs from 'fs';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileLimit) private fileLimit: Repository<FileLimit>,
    @InjectRepository(File) private fileRepo: Repository<File>,
    @InjectRepository(Folder) private folderRepo: Repository<Folder>,
    private queryService: QueryService,
  ) {}
  async validate(file: Express.Multer.File) {
    const findFileType = await this.fileLimit.findOne({
      where: {
        fileType: file.mimetype as EFileType,
      },
    });
    if (!findFileType) throw new Error(`Không hỗ trợ loại file này!`);

    const maxFileSize = findFileType.maxSize * 1024 * 1024; //byte -> Mb

    if (file.size > maxFileSize)
      throw new Error(
        `Loại file ${file.mimetype} chỉ được upload tối đa ${findFileType.maxSize} Mb!`,
      );
  }

  async handling(
    file: Express.Multer.File,
    body: any,
    req: CustomRequest,
    query: TQuery,
    queryRunner: QueryRunner,
  ) {
    const extension = path.extname(file.originalname);
    const fileRepo = queryRunner.manager.getRepository(File);
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
    const createdFile = await this.queryService.create({
      repository: fileRepo,
      body: {
        mimeType: file.mimetype as EFileType,
        extension: extension as FileExtension,
        originalName: file.originalname,
        size: file.size,
        user: req.raw.user.id,
        ...(body.folder && {
          folder: body.folder as any,
        }),
      },
      query,
    });

    const id = createdFile.data.id;
    const filePath = path.join(
      process.cwd(),
      '/public',
      folder ? folder.name : '',
      `${id}${extension}`,
    );
    await fs.promises.writeFile(filePath, file.buffer);
    return createdFile;
  }
}
