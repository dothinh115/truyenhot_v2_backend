import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { MeService } from './me.service';
import { TQuery } from '@/core/utils/models/query.model';
import { CustomRequest } from '@/core/utils/models/request.model';
import { RolesGuard } from '../guards/role.guard';

@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @UseGuards(RolesGuard)
  @Get()
  find(@Req() req: CustomRequest, @Query() query: TQuery) {
    const { _id } = req.user;
    return this.meService.find(_id, query);
  }
}
