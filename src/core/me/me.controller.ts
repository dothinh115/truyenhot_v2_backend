import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { MeService } from './me.service';
import { TQuery } from '@/core/utils/models/query.model';
import { CustomRequest } from '@/core/utils/models/request.model';
import { RolesGuard } from '../guards/role.guard';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @UseGuards(RolesGuard)
  @Get()
  find(@Req() req: CustomRequest, @Query() query: TQuery) {
    const { _id } = req.user;
    return this.meService.find(_id, query);
  }

  @UseGuards(RolesGuard)
  @Patch()
  update(
    @Req() req: CustomRequest,
    @Body() body: UpdateMeDto,
    @Query() query: TQuery,
  ) {
    const { _id } = req.user;
    return this.meService.update(_id, query, body);
  }
}
