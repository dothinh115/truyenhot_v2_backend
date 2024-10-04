import { Controller, Get, Body, Patch, Query } from '@nestjs/common';
import { MeService } from './me.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { TQuery } from '../utils/model.util';
import { Excluded } from '../decorators/excluded-route.decorator';
import { User } from '../decorators/user.decorator';
import { User as ReqUser } from '../user/entities/user.entity';

@Controller('me')
@Excluded()
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  findAll(@Query() query: TQuery, @User() user: ReqUser) {
    return this.meService.find(query, user);
  }

  @Patch()
  update(
    @Body() body: UpdateMeDto,
    @User() user: ReqUser,
    @Query() query: TQuery,
  ) {
    return this.meService.update(body, user, query);
  }
}
