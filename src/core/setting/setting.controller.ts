import { Controller, Body, Param, Query, Get, Patch } from '@nestjs/common';
import { SettingService } from './setting.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { TQuery } from '../utils/model.util';
import { Protected } from '../decorators/protected-route.decorator';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @Protected()
  find(@Query() query: TQuery) {
    return this.settingService.find(query);
  }

  @Patch(':id')
  @Protected()
  update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @Query() query: TQuery,
  ) {
    return this.settingService.update(id, updateSettingDto, query);
  }
}
