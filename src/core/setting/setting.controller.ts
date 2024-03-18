import { Controller, Get, Body, Patch, Query, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { TQuery } from '@/core/utils/models/query.model';
import { RolesGuard } from '@/core/guards/role.guard';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @UseGuards(RolesGuard)
  @Get()
  find(@Query() query: TQuery) {
    return this.settingService.find(query);
  }

  @UseGuards(RolesGuard)
  @Patch()
  update(@Body() body: any, @Query() query: TQuery) {
    return this.settingService.update(body, query);
  }
}
