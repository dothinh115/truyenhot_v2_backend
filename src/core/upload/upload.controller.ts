import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFolderDto } from './dto/create-folder.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { RolesGuard } from '@/core/main/services/roles.guard';
import { CustomRequest } from '@/core/utils/models/request.model';
import { TokenRequired } from '@/core/main/services/strategy.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(TokenRequired, RolesGuard)
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

  @UseGuards(TokenRequired, RolesGuard)
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
