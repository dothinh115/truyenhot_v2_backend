import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { BaseApiService } from '../services/crud.base';
import { InjectRepository } from '@nestjs/typeorm';
import { Logs } from './entities/log.entity';
import { Repository } from 'typeorm';
import { QueryService } from '../query/query.service';

@Injectable()
export class LogsService extends BaseApiService<CreateLogDto, UpdateLogDto> {
  constructor(
    @InjectRepository(Logs) private logRepo: Repository<Logs>,
    protected queryService: QueryService,
  ) {
    super(logRepo, queryService);
  }
}
