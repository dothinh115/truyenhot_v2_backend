import { BadGatewayException, Injectable } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/model.util';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting) private settingRepo: Repository<Setting>,
    private queryService: QueryService,
  ) {}

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.settingRepo,
        query,
      });
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async update(id: string, body: UpdateSettingDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.settingRepo,
        id,
        query,
        body,
      });
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
