import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { MeService } from './me.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { CustomRequest, TQuery } from '../utils/model.util';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  findAll(@Query() query: TQuery, @Req() req: CustomRequest) {
    return this.meService.find(query, req);
  }

  @Patch()
  update(
    @Body() body: UpdateMeDto,
    @Req() req: CustomRequest,
    @Query() query: TQuery,
  ) {
    return this.meService.update(body, req, query);
  }
}
