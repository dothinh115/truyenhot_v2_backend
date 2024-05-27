import { Controller, Get, UseGuards, Req, Query, Patch } from '@nestjs/common';
import { MeService } from './me.service';
import { TQuery } from '@/core/utils/models/query.model';
import { CustomRequest } from '@/core/utils/models/request.model';
import { RolesGuard } from '../guards/role.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { Fields } from '../decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @Get()
  find(@Req() req: CustomRequest, @Query() query: TQuery) {
    const { _id } = req.user;
    return this.meService.find(_id, query);
  }

  @Patch()
  update(
    @Req() req: CustomRequest,
    @Fields() body: UpdateMeDto,
    @Query() query: TQuery,
  ) {
    const { _id } = req.user;
    return this.meService.update(_id, query, body);
  }
}
