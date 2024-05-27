import { Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { TQuery } from '@/core/utils/models/query.model';
import { RolesGuard } from '@/core/guards/role.guard';
import { Fields } from '../decorator/field.decorator';

@UseGuards(RolesGuard)
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  find(@Query() query: TQuery) {
    return this.settingService.find(query);
  }

  @Patch()
  update(@Fields() body: any, @Query() query: TQuery) {
    return this.settingService.update(body, query);
  }
}
