import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FieldService } from './field.service';
import { FilterService } from './filter.service';
import { SortService } from './sort.service';
import { MetaService } from './meta.service';
import { QueryUtilService } from './query-util.service';

@Injectable()
export class QueryBuilderService {
  queryBuilder: SelectQueryBuilder<any>;
  entityName: string;
  joinData = new Set<string>();
  metaData: ('totalCount' | 'filterCount')[] = [];
  isFiltering: boolean = false;
  fieldDataArr: string[] = [];
  clonedQueryBuilder: SelectQueryBuilder<any>;

  constructor(
    private fieldService: FieldService,
    private filterService: FilterService,
    private sortService: SortService,
    private metaService: MetaService,
    private queryUtilService: QueryUtilService,
  ) {}

  create(repository: Repository<any>) {
    this.entityName = repository.metadata.name.toLowerCase();
    this.queryBuilder = repository.createQueryBuilder(this.entityName);
    this.clonedQueryBuilder = this.queryBuilder.clone();
    return this;
  }

  field(fields: string[]) {
    const fieldData = this.fieldService.handleFields({
      joinData: this.joinData,
      fields,
      entityName: this.entityName,
    });
    this.fieldDataArr = Array.from(fieldData);

    return this;
  }

  filter(filter: object) {
    if (Object.keys(filter).length > 0) this.isFiltering = true;
    else return this;
    const filterDataArr = this.filterService.handleFilter({
      joinData: this.joinData,
      filter,
      entityName: this.entityName,
    });

    if (filterDataArr.length > 0) {
      let where = '';
      let variables = {};
      filterDataArr
        .filter((item) => item.where && item.variable && item.type)
        .forEach((item, index) => {
          if (index === 0) {
            where += `(${item.where})`;
          } else {
            where += ` ${item.type.toUpperCase()} (${item.where})`;
          }
          variables = {
            ...variables,
            ...item.variable,
          };
        });

      this.queryBuilder.where(where, variables);
    }
    return this;
  }

  sort(sort: string[]) {
    if (!sort) return this;
    const sortArr = this.sortService.handleSort({
      joinData: this.joinData,
      sort,
      entityName: this.entityName,
    });
    if (sortArr.length > 0) {
      let orderByObj = {};
      sortArr.map((sortItem) => {
        orderByObj = {
          ...orderByObj,
          [sortItem.field]: sortItem.type,
        };
      });
      this.queryBuilder.orderBy(orderByObj);
    }

    return this;
  }

  meta(meta: string[]) {
    if (!meta || meta.length === 0) return this;
    this.metaData = this.metaService.handleMeta(meta);
    return this;
  }

  paginate({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    if (skip !== 0) this.queryBuilder.skip(skip);
    this.queryBuilder.take(limit);
    return this;
  }

  async build() {
    //sau khi có dc joinData thì tiến hành join vào
    let joinDataArr = Array.from(this.joinData);
    if (joinDataArr.length > 0) {
      await Promise.all(
        joinDataArr.map(async (item) => {
          const joinObj = JSON.parse(item);
          this.queryBuilder.leftJoinAndSelect(joinObj.field, joinObj.alias);
        }),
      );
    }

    //add select field
    this.fieldDataArr = this.fieldDataArr.filter(
      (field) => !field.includes('user.password'),
    );

    if (this.fieldDataArr.length > 0) {
      if (!this.fieldDataArr.includes(`${this.entityName}.id`))
        this.fieldDataArr.push(`${this.entityName}.id`);
      this.queryBuilder.select(this.fieldDataArr);
    }

    const getMany = this.isFiltering
      ? await this.queryBuilder.getManyAndCount()
      : await this.queryBuilder.getMany();

    let filterCount: number;
    let totalCount: number;
    if (this.metaData && this.metaData.includes('totalCount')) {
      totalCount = await this.clonedQueryBuilder.getCount();
    }
    if (this.metaData && this.metaData.includes('filterCount')) {
      if (!this.isFiltering) {
        if (!totalCount) {
          totalCount = await this.clonedQueryBuilder.getCount();
        }
        filterCount = totalCount;
      } else filterCount = getMany[1];
    }

    const result = this.isFiltering ? getMany[0] : getMany;

    await Promise.all(
      result.map((item: any) => {
        this.queryUtilService.handleMapResult(item);
      }),
    );
    return {
      data: result,
      ...((this.metaData.includes('totalCount') || filterCount) && {
        meta: {
          ...(this.metaData.includes('totalCount') && {
            totalCount,
          }),
          ...(filterCount && { filterCount }),
        },
      }),
    };
  }
}
