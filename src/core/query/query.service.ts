import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TQuery } from '../utils/model.util';
import { QueryBuilderService } from './query-builder.service';
import { QueryUtilService } from './query-util.service';
import { OrmService } from './orm.service';
import * as qs from 'qs';

@Injectable()
export class QueryService {
  constructor(
    private queryBuilderService: QueryBuilderService,
    private queryUtilService: QueryUtilService,
    private ormService: OrmService,
  ) {}

  public async query({
    repository,
    query,
    id,
  }: {
    repository: Repository<any>;
    query: any;
    id?: string | number;
  }) {
    query = qs.parse(query, { depth: 10 });
    const fields = query.fields
      ? query.fields.split(',').filter((x) => x !== '')
      : [];
    let filter = query.filter || {};
    const page = query.page || 1;
    const limit = query.limit || 10;
    const meta = query.meta
      ? query.meta.split(',').filter((x) => x !== '')
      : [];
    const sort = query.sort
      ? query.sort.split(',').filter((x) => x !== '')
      : ['id'];

    if (id) {
      filter = {
        ...filter,
        id: { _eq: id },
      };
    }

    const queryBuilder = this.queryBuilderService.create(repository);
    const result = await queryBuilder
      .field(fields)
      .filter(filter)
      .sort(sort)
      .meta(meta)
      .build({ page, limit });
    return result;
  }

  async create<T>({
    repository,
    body,
    query = {},
    checkIsExists,
  }: {
    repository: Repository<any>;
    body: T;
    query: TQuery;
    checkIsExists?: Partial<T>;
  }) {
    //set default role nếu có
    const entityName = repository.metadata.name.toLowerCase();

    if (entityName === 'user') {
      body = await this.queryUtilService.setDefaultRole(body);
    }

    //check exist nếu có
    if (checkIsExists) {
      const isExists = await repository.exists({
        where: checkIsExists,
      });
      if (isExists) {
        throw new Error(`${JSON.stringify(checkIsExists)} đã tồn tại.`);
      }
    }

    //convert cho đúng định dạng của entity
    body = this.queryUtilService.convertToEntity(entityName, body);

    //create entity và tiến hành lưu vào db
    const newItem = repository.create(body);
    const created = await repository.save(newItem);

    //trả ra kết quả với filter là id của item vừa lưu
    return await this.query({
      repository,
      query,
      id: created.id,
    });
  }

  async update<T>({
    repository,
    id,
    body,
    query = {},
  }: {
    repository: Repository<any>;
    id: string | number;
    body: T;
    query: TQuery;
  }) {
    //check exist trước khi update
    const item = await repository.findOne({
      where: {
        id,
      },
    });
    if (!item) throw new Error('Record không tồn tại!');
    const entityName = repository.metadata.name.toLowerCase();
    //nếu đang update setting
    if (entityName === 'setting') {
      this.queryUtilService.resetDefaultRole(body);
    }

    //convert cho đúng định dạng của entity
    body = this.queryUtilService.convertToEntity(entityName, body);

    for (const key of Object.keys(body)) {
      item[key] = body[key];
    }
    const updated = await repository.save(item);
    return await this.query({
      repository,
      query,
      id: updated.id,
    });
  }

  async delete({
    repository,
    id,
  }: {
    repository: Repository<any>;
    id: string | number;
  }) {
    //check exist
    const isExists = await repository.findOne({
      where: {
        id,
      },
    });
    if (!isExists) throw new Error('Record không tồn tại!');
    //check relation để báo lỗi cho đúng
    await this.ormService.checkIfReferenced(repository, id);

    //nếu pass hết thì tiến hành xoá
    await repository.delete(id);
    return isExists;
  }
}
