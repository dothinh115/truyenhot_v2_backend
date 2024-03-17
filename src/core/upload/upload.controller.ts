import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TQuery } from '@/core/utils/models/query.model';
import { RolesGuard } from '@/core/guards/roles.guard';
import { CustomRequest } from '@/core/utils/models/request.model';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(RolesGuard)
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: CustomRequest,
    @Query() query: TQuery,
  ) {
    return this.uploadService.uploadSingleFile(file, req, query);
  }

  @UseGuards(RolesGuard)
  @Post('file/:folder')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFileWithFolder(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
    @Req() req: CustomRequest,
    @Query() query: TQuery,
  ) {
    return this.uploadService.uploadSingleFileWithFolder(
      file,
      folder,
      req,
      query,
    );
  }

  @UseGuards(RolesGuard)
  @Post('folder')
  createFolder(@Body() body: CreateFolderDto, @Query() query: TQuery) {
    return this.uploadService.createFolder(body, query);
  }
}
