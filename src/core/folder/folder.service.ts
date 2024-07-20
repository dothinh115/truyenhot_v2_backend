import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Folder } from '../folder/entities/folder.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { CustomRequest, TQuery } from '../utils/model.util';
import { CreateFolderDto } from '../folder/dto/create-folder.dto';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateFolderDto } from '../folder/dto/update-folder.dto';

@Injectable()
export class FolderService {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Folder) private folderRepo: Repository<Folder>,
    private queryService: QueryService,
  ) {}

  async create(req: CustomRequest, body: CreateFolderDto, query: TQuery) {
    //thêm user vào body để xác định ai là người tạo folder
    const bodyWithUserId = {
      ...body,
      user: req.user.id,
    };
    //phân tích path của folder
    const projectDir = process.cwd();
    const folderName = body.name;
    const folderPath = path.join(projectDir, '/public/', folderName);

    //tạo queryRunner
    const connection = this.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //kiểm tra và tạo db nếu chưa có folder này
      const newFolder = await this.queryService.create({
        repository: this.folderRepo,
        body: bodyWithUserId,
        query,
        checkIsExists: {
          name: body.name,
        },
      });

      await fs.promises.mkdir(folderPath, { recursive: true });

      //tạo thành công thì commit transaction này
      await queryRunner.commitTransaction();
      return newFolder;
    } catch (error) {
      //nếu có gì đỏ xảy ra, phải xoá cả thư mục trong hệ thống và rollback ở db
      await queryRunner.rollbackTransaction();

      try {
        const isFolderExists = await this.folderRepo.existsBy({
          name: body.name,
        });
        if (!isFolderExists)
          await fs.promises.rm(folderPath, {
            recursive: true,
            force: true,
          });
      } catch (error) {
        console.log('Có lỗi xảy ra khi xoá folder ' + folderPath);
      }

      //ném lỗi cho người dùng
      throw new BadRequestException(error.message);
    } finally {
      //dù tạo dc hay ko thì cũng giải phóng queryRunner
      await queryRunner.release();
    }
  }

  async find(query: TQuery) {
    return await this.queryService.query({
      repository: this.folderRepo,
      query,
    });
  }

  async update(id: string, body: UpdateFolderDto, query: TQuery) {
    const connection = this.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const folder = await this.folderRepo.findOne({
        where: {
          id,
        },
      });
      if (!folder) throw new Error('Không có folder này!');

      //kiểm tra xem tên dc đổi có trùng hay ko
      const ifFolderNameExists = await this.folderRepo.findOne({
        where: {
          name: body.name,
          id: Not(folder.id),
        },
      });
      if (ifFolderNameExists) throw new Error('Thư mục này đã tồn tại!');

      const projectDir = process.cwd();
      const oldFolderPath = path.join(projectDir, '/public/', folder.name);
      const newFolderPath = path.join(projectDir, '/public/', body.name);

      const updatedFolder = await this.queryService.update({
        repository: this.folderRepo,
        body,
        id,
        query,
      });

      try {
        await fs.promises.rename(oldFolderPath, newFolderPath);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `Lỗi khi đổi tên thư mục ${oldFolderPath} thành ${newFolderPath}: ${error.message}`,
        );
      }

      await queryRunner.commitTransaction();
      return updatedFolder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string) {
    try {
      await this.queryService.delete({
        repository: this.folderRepo,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
