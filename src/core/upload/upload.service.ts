import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Folder } from './schema/folder.schema';
import { Model } from 'mongoose';
import { QueryService } from 'src/core/main/query.service';
import { TQuery } from 'src/core/utils/models/query.model';
import * as fs from 'fs';
import { CommonService } from 'src/core/main/common.service';
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
    if (file) {
      const result = await this.fileModel.create({
        _id: (file as any)._id,
        mimeType: file.mimetype,
        originalName: file.originalname,
        user: req.user._id.toString(),
        size: file.size,
        extension: (file as any).extension,
      });
      return await this.queryService.handleQuery(
        this.fileModel,
        query,
        result._id,
      );
    }
  }

  async uploadSingleFileWithFolder(
    file: Express.Multer.File,
    folder: string,
    req: CustomRequest,
    query: TQuery,
  ) {
    const exists = await this.folderModel.findById(folder);
    if (!exists) throw new BadRequestException('Không có folder này!');
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
      return await this.queryService.handleQuery(
        this.fileModel,
        query,
        result._id,
      );
    }
  }

  async file(query: TQuery) {
    return await this.queryService.handleQuery(this.fileModel, query);
  }

  async deleteFile(id: string) {
    const exists = await this.fileModel.findById(id);
    if (!exists) throw new BadRequestException('Không tồn tại file này!');
    let file = `${process.cwd()}/upload`;
    if (exists.folder) file += '/' + exists.folder;
    file += '/' + exists._id.toString() + exists.extension;
    if (fs.existsSync(file)) {
      fs.rmSync(file);
    }
    await this.fileModel.findByIdAndDelete(id);

    return {
      message: 'Thành công!',
    };
  }

  async folder(query: TQuery) {
    return await this.queryService.handleQuery(this.folderModel, query);
  }

  async createFolder(body: CreateFolderDto, query: TQuery) {
    const exists = await this.folderModel.findOne({
      slug: this.commonService.toSlug(body.title),
    });
    if (exists) throw new BadRequestException('Folder đã tồn tại!');
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
  }

  async deleteFolder(id: string) {
    const exists: any = await this.folderModel.findById(id);
    if (!exists) throw new BadRequestException('Folder không tồn tại!');
    const dir = `${process.cwd()}/upload/${exists.slug}`;
    //xoá thư mục đồng nghĩa với xoá toàn bộ files trong thư mục đó
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    await this.folderModel.findByIdAndDelete(id);
    return {
      message: 'Thành công!',
    };
  }
}
