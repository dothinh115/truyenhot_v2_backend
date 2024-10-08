import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Folder } from '../folder/entities/folder.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { CustomRequest, TQuery } from '../utils/model.util';
import { CreateFolderDto } from '../folder/dto/create-folder.dto';
import fs from 'fs';
import path from 'path';
import { UpdateFolderDto } from '../folder/dto/update-folder.dto';
import { File } from '../file/entities/file.entity';

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
      user: req.raw.user.id,
    };
    //phân tích path của folder
    const projectDir = process.cwd();
    const folderName = body.name;
    const folderPath = path.join(projectDir, '/public', folderName);

    //tạo queryRunner
    const connection = this.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const folderRepo = queryRunner.manager.getRepository(Folder);

    try {
      //kiểm tra và tạo db nếu chưa có folder này
      const newFolder = await this.queryService.create({
        repository: folderRepo,
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
        const isFolderExists = await folderRepo.existsBy({
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
    try {
      return await this.queryService.query({
        repository: this.folderRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, body: UpdateFolderDto, query: TQuery) {
    const connection = this.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const folderRepo = queryRunner.manager.getRepository(Folder);
    try {
      const folder = await folderRepo.findOne({
        where: {
          id,
        },
      });
      if (!folder) throw new Error('Không có folder này!');

      //kiểm tra xem tên dc đổi có trùng hay ko
      const ifFolderNameExists = await folderRepo.findOne({
        where: {
          name: body.name,
          id: Not(folder.id),
        },
      });
      if (ifFolderNameExists) throw new Error('Thư mục này đã tồn tại!');

      const projectDir = process.cwd();
      const oldFolderPath = path.join(projectDir, '/public', folder.name);
      const newFolderPath = path.join(projectDir, '/public', body.name);

      const updatedFolder = await this.queryService.update({
        repository: folderRepo,
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
    const connection = this.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const folderRepo = queryRunner.manager.getRepository(Folder);
    const fileRepo = queryRunner.manager.getRepository(File);

    try {
      let folder = await folderRepo.findOne({
        where: {
          id,
        },
      });
      if (!folder) throw new Error('Folder này không tồn tại!');

      //tiến hành xoá toàn bộ file có trong folder
      const files = await fileRepo.find({
        where: {
          folder,
        },
      });
      if (files.length > 0) {
        await fileRepo.remove(files);
      }

      //xoá folder
      await folderRepo.remove(folder);

      //xoá file trong hệ thống
      const folderPath = path.join(process.cwd(), '/public', folder.name);
      await fs.promises.rm(folderPath, { recursive: true });
      await queryRunner.commitTransaction();
      return 'Thành công!';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
