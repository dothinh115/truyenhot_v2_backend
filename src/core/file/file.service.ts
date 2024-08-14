import { BadRequestException, Injectable } from '@nestjs/common';
import { FileUploadService } from '../upload/upload.service';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CustomRequest, TQuery } from '../utils/model.util';
import { File } from './entities/file.entity';
import { QueryService } from '../query/query.service';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from '../response/response.service';

@Injectable()
export class FileService {
  constructor(
    private fileUploadService: FileUploadService,
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(File) private fileRepo: Repository<File>,
    private queryService: QueryService,
    private responseService: ResponseService,
  ) {}
  async create(
    file: Express.Multer.File,
    body: any,
    req: CustomRequest,
    query: TQuery,
  ) {
    const connection = this.entityManager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //kiểm tra tính hợp lệ của file
      await this.fileUploadService.validate(file);

      //nếu hợp lệ thì lưu vào db và lưu file vào hệ thống
      const createdFile = await this.fileUploadService.handling(
        file,
        body,
        req,
        query,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      return createdFile;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const errorData = JSON.parse(error.message);
      if ('fileId' in errorData) {
        throw new BadRequestException({
          message: errorData.message,
          fileId: errorData.fileId,
        });
      }
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.fileRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    const connection = this.entityManager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const fileRepo = queryRunner.manager.getRepository(File);
    try {
      const deletedFile = await this.queryService.delete({
        repository: fileRepo,
        id,
      });

      const filePath = path.join(
        process.cwd(),
        '/public',
        deletedFile.data.folder ? deletedFile.data.folder : '',
        `${deletedFile.data.id}${deletedFile.data.extension}`,
      );
      try {
        await fs.promises.access(filePath);
      } catch (error) {
        throw new Error(
          'Không thể access đến file, có thể file không tồn tại trong hệ thống!',
        );
      }
      await fs.promises.rm(filePath, { force: true });

      await queryRunner.commitTransaction();
      return this.responseService.success('Thành công!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
