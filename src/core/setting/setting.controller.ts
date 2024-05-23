import { Controller, Get, Body, Patch, Query, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { TQuery } from '@/core/utils/models/query.model';
import { RolesGuard } from '@/core/guards/role.guard';

@UseGuards(RolesGuard)
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  find(@Query() query: TQuery) {
    return this.settingService.find(query);
  }

  @Patch()
  update(@Body() body: any, @Query() query: TQuery) {
    return this.settingService.update(body, query);
  }
}
