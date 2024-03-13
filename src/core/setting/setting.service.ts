import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { TQuery } from 'src/core/utils/models/query.model';
import { InjectModel } from '@nestjs/mongoose';
import { Setting } from './schema/setting.schema';
import { Model } from 'mongoose';
import { QueryService } from 'src/core/main/services/query.service';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name) private settingService: Model<Setting>,
    private queryService: QueryService,
  ) {}
  async find(query: TQuery) {
    try {
      return await this.queryService.handleQuery(this.settingService, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(body: UpdateSettingDto, query: TQuery) {
    try {
      await this.settingService.findOneAndUpdate(body);
      return await this.queryService.handleQuery(this.settingService, query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
