import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { Protected } from '../decorators/protected-route.decorator';
import { CustomRequest, TQuery } from '../utils/model.util';
import { Excluded } from '../decorators/excluded-route.decorator';

@Controller('file')
@Protected()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileFastifyInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: CustomRequest,
    @Query() query: TQuery,
  ) {
    return this.fileService.create(file, body, req, query);
  }

  @Get()
  @Excluded()
  find(@Query() query: TQuery) {
    return this.fileService.find(query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
