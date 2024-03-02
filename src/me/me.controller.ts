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
import { TokenRequired } from 'src/strategy';
import { TQuery } from 'src/utils/models/query.model';
import { CustomRequest } from 'src/utils/models/request.model';
import { UserService } from 'src/user/user.service';
import { UpdateMeDto } from './dto/update-me.dto';

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
