import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Folder } from './schema/folder.schema';
import { Model } from 'mongoose';
import { QueryService } from 'src/core/main/services/query.service';
import { TQuery } from 'src/core/utils/models/query.model';
import * as fs from 'fs';
import { CommonService } from 'src/core/main/services/common.service';
import { CustomRequest } from 'src/core/utils/models/request.model';
import { File } from './schema/file.schema';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    @InjectModel(File.name) private fileModel: Model<File>,
    private queryService: QueryService,
    private commonService: CommonService,
  ) {}
  async uploadSingleFile(
    file: Express.Multer.File,
    req: CustomRequest,
    query: TQuery,
  ) {
    //ở multer service phải đảm bảo check toàn bộ dữ liệu để khi đến dc bước này thì các thông số phải valid
    try {
      const result = await this.fileModel.create({
        _id: (file as any)._id,
        mimeType: file.mimetype,
        originalName: file.originalname,
        user: req.user._id.toString(),
        size: file.size,
        extension: (file as any).extension,
      });
      //Nếu tạo db không thành công thì phải xoá file đã up và quăng ra lỗi
      if (!result) throw new Error('Đã có lỗi xảy ra!');
      return await this.queryService.handleQuery(
        this.fileModel,
        query,
        result._id,
      );
    } catch (error) {
      //xoá file đã up
      const path =
        process.cwd() +
        '/upload/' +
        (file as any)._id +
        (file as any).extension;
      this.commonService.removeFileOrFolder(path);
      throw new BadRequestException(error.message);
    }
  }

  async uploadSingleFileWithFolder(
    file: Express.Multer.File,
    folder: string,
    req: CustomRequest,
    query: TQuery,
  ) {
    //ở multer service phải đảm bảo check toàn bộ dữ liệu để khi đến dc bước này thì các thông số phải valid
    try {
      const exists = await this.folderModel.findById(folder);
      if (!exists) throw new Error('Không có folder này!');
      if (file) {
        const result = await this.fileModel.create({
          _id: (file as any)._id,
          mimeType: file.mimetype,
          originalName: file.originalname,
          user: req.user._id.toString(),
          size: file.size,
          extension: (file as any).extension,
          folder,
        });
        if (!result) throw new Error('Đã có lỗi xảy ra!');
        return await this.queryService.handleQuery(
          this.fileModel,
          query,
          result._id,
        );
      }
    } catch (error) {
      //xoá file đã up
      const findFolder = await this.folderModel.findById(folder);
      const path =
        process.cwd() +
        '/upload/' +
        findFolder.slug +
        '/' +
        (file as any)._id +
        (file as any).extension;
      this.commonService.removeFileOrFolder(path);
      throw new BadRequestException(error.message);
    }
  }

  async file(query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.fileModel, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteFile(id: string) {
    try {
      const exists = await this.fileModel.findById(id);
      if (!exists) throw new Error('Không tồn tại file này trong db!');
      let path = `${process.cwd()}/upload`;
      if (exists.folder) path += '/' + exists.folder;
      path += '/' + exists._id.toString() + exists.extension;
      if (fs.existsSync(path)) {
        this.commonService.removeFileOrFolder(path);
      } else throw new Error('Không tồn tại file này trong hệ thống!');
      await this.fileModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      //quăng lỗi
      throw new BadRequestException(error.message);
    }
  }

  async folder(query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.folderModel, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createFolder(body: CreateFolderDto, query: TQuery) {
    try {
      const exists = await this.folderModel.findOne({
        slug: this.commonService.toSlug(body.title),
      });
      if (exists) throw new Error('Folder đã tồn tại!');
      const dir = `${process.cwd()}/upload/${this.commonService.toSlug(
        body.title,
      )}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const result = await this.folderModel.create(body);
      return await this.queryService.handleQuery(
        this.folderModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteFolder(id: string) {
    try {
      const exists: any = await this.folderModel.findById(id);
      if (!exists) throw new Error('Folder không tồn tại!');
      const path = `${process.cwd()}/upload/${exists.slug}`;
      //xoá thư mục đồng nghĩa với xoá toàn bộ files trong thư mục đó
      if (fs.existsSync(path)) {
        this.commonService.removeFileOrFolder(path, true);
      }

      await this.folderModel.findByIdAndDelete(id);
      return {
        message: 'Thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
