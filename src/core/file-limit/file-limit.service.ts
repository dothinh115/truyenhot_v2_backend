import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateFileLimitDto } from './dto/update-file-limit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileLimit } from './entities/file-limit.entity';
import { Repository } from 'typeorm';
import { TQuery } from '../utils/model.util';
import { QueryService } from '../query/query.service';

@Injectable()
export class FileLimitService {
  constructor(
    @InjectRepository(FileLimit) private fileLimitRepo: Repository<FileLimit>,
    private queryService: QueryService,
  ) {}

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.fileLimitRepo,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, body: UpdateFileLimitDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.fileLimitRepo,
        body,
        id,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
