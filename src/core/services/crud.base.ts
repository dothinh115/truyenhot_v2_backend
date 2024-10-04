import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QueryService } from 'src/core/query/query.service';
import { TQuery } from 'src/core/utils/model.util';

@Injectable()
export class BaseApiService<CreateDto, UpdateDto> {
  constructor(
    protected repository: Repository<any>,
    protected queryService: QueryService,
  ) {}
  async create(body: CreateDto, query: TQuery) {
    try {
      return await this.queryService.create({
        repository: this.repository,
        query,
        body,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async find(query: TQuery) {
    try {
      return await this.queryService.query({
        repository: this.repository,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, body: UpdateDto, query: TQuery) {
    try {
      return await this.queryService.update({
        repository: this.repository,
        body,
        id,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number | string) {
    try {
      return this.queryService.delete({
        repository: this.repository,
        id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
