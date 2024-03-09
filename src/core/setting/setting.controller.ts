import { Controller, Get, Body, Patch, Query, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { TQuery } from 'src/core/utils/models/query.model';
import { RolesGuard } from 'src/core/main/roles.guard';
import { TokenRequired } from '../main/strategy.service';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @UseGuards(TokenRequired, RolesGuard)
  @Get()
  find(@Query() query: TQuery) {
    return this.settingService.find(query);
  }

  @UseGuards(TokenRequired, RolesGuard)
  @Patch()
  update(@Body() body: UpdateSettingDto, @Query() query: TQuery) {
    return this.settingService.update(body, query);
  }
}
