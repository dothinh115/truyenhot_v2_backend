import { Injectable } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { TQuery } from 'src/utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Setting } from './schema/setting.schema';
import { Model } from 'mongoose';
import { QueryService } from 'src/query/query.service';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name) private settingService: Model<Setting>,
    private queryService: QueryService,
  ) {}
  async find(query: TQuery) {
    return await this.queryService.handleQuery(this.settingService, query);
  }

  async update(body: UpdateSettingDto, query: TQuery) {
    await this.settingService.findOneAndUpdate(body);
    return await this.queryService.handleQuery(this.settingService, query);
  }
}
