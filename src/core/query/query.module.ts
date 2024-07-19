import { Global, Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { OrmService } from './orm.service';
import { FieldService } from './field.service';
import { FilterService } from './filter.service';
import { SortService } from './sort.service';
import { MetaService } from './meta.service';
import { QueryUtilService } from './query-util.service';
import { QueryBuilderService } from './query-builder.service';

@Global()
@Module({
  providers: [
    QueryService,
    OrmService,
    FieldService,
    FilterService,
    SortService,
    MetaService,
    QueryUtilService,
    QueryBuilderService,
  ],
  exports: [QueryService, OrmService],
})
export class QueryModule {}
