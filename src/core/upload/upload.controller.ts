import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { fileValidator } from 'src/core/middlewares/pipes/file-validator.pipe';
import { CreateFolderDto } from './dto/create-folder.dto';
import { TQuery } from 'src/core/utils/models/query.model';
import { RolesGuard } from 'src/core/main/roles.guard';
import { CustomRequest } from 'src/core/utils/models/request.model';
import { TokenRequired } from 'src/core/main/strategy.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(TokenRequired, RolesGuard)
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFile(
    @UploadedFile(fileValidator())
    file: Express.Multer.File,
    @Req() req: CustomRequest,
    @Query() query: TQuery,
  ) {
    return this.uploadService.uploadSingleFile(file, req, query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiFiles(
    @UploadedFiles(fileValidator()) files: Express.Multer.File[],
    @Req() req: CustomRequest,
    @Query() query: TQuery,
  ) {
    return this.uploadService.uploadMultiFiles(files, req, query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Get('file')
  file(@Query() query: TQuery) {
    return this.uploadService.file(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Delete('file/:id')
  deleteFile(@Param('id') id: string) {
    return this.uploadService.deleteFile(id);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Get('folder')
  folder(@Query() query: TQuery) {
    return this.uploadService.folder(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Post('folder')
  createFolder(@Body() body: CreateFolderDto, @Query() query: TQuery) {
    return this.uploadService.createFolder(body, query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Delete('folder/:id')
  deleteFolder(@Param('id') id: string) {
    return this.uploadService.deleteFolder(id);
  }
}
