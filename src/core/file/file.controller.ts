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
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { Protected } from '../decorators/protected-route.decorator';
import { TQuery } from '../utils/model.util';
import { User } from '../decorators/user.decorator';
import { User as TUser } from '../user/entities/user.entity';

@Controller('file')
@Protected()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileFastifyInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @User() user: TUser,
    @Query() query: TQuery,
  ) {
    return this.fileService.create(file, body, user, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.fileService.find(query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
