import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Protected } from '../decorators/protected-route.decorator';
import { CustomRequest, TQuery } from '../utils/model.util';
import { CreateFolderDto } from '../folder/dto/create-folder.dto';
import { UpdateFolderDto } from '../folder/dto/update-folder.dto';
import { FolderService } from './folder.service';

@Controller('folder')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post()
  @Protected()
  create(
    @Req() req: CustomRequest,
    @Body() body: CreateFolderDto,
    @Query() query: TQuery,
  ) {
    return this.folderService.create(req, body, query);
  }

  @Get()
  find(@Query() query: TQuery) {
    return this.folderService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() body: UpdateFolderDto,
    @Query() query: TQuery,
  ) {
    return this.folderService.update(id, body, query);
  }

  @Delete('id')
  delete(@Param('id') id: string) {
    return this.folderService.delete(id);
  }
}
