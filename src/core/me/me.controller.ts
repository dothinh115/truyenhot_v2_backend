import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { MeService } from './me.service';
import { TQuery } from '@/core/utils/models/query.model';
import { CustomRequest } from '@/core/utils/models/request.model';
import { UserService } from '@/core/user/user.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { TokenRequired } from '../main/services/strategy.service';

@Controller('me')
export class MeController {
  constructor(
    private meService: MeService,
    private userService: UserService,
  ) {}

  @UseGuards(TokenRequired)
  @Get()
  find(@Req() req: CustomRequest, @Query() query: TQuery) {
    const { _id } = req.user;
    return this.meService.find(_id, query);
  }

  @UseGuards(TokenRequired)
  @Patch()
  update(
    @Req() req: CustomRequest,
    @Body() body: UpdateMeDto,
    @Query() query: TQuery,
  ) {
    const { _id } = req.user;
    return this.userService.update(_id, body, query, _id);
  }
}
