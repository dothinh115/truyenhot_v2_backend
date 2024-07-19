import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import { OrmService } from './orm.service';
import { CommonService } from '../common/common.service';
import { compareKey } from '../utils/compare-operator.util';
import { QueryUtilService } from './query-util.service';

@Injectable()
export class FilterService {
  constructor(
    private ormService: OrmService,
    private commonService: CommonService,
    private queryUtilService: QueryUtilService,
  ) {}

  private mergeConditions(conditions: any, filterDataArr: any[]) {
    for (const [key, value] of Object.entries(conditions)) {
      if ((key === 'and' || key === 'or') && Array.isArray(value)) {
        const data = {
          where: '',
          variable: {},
          type: null,
        };
        for (const item of value) {
          if ((key === 'and' || key === 'or') && item.where) {
            const conjunction = key.toUpperCase(); // "AND" hoặc "OR"
            data.where +=
              data.where === '' ? item.where : ` ${conjunction} ${item.where}`;
            data.variable = { ...data.variable, ...item.variable };
            data.type = key;
          }
          this.mergeConditions(item, filterDataArr);
        }
        filterDataArr.push(data);
      }
    }
  }

  private handleNestedFilter({
    joinData,
    object,
    prevAlias,
    prevProperty,
  }: {
    joinData: Set<string>;
    object: any;
    prevAlias: string;
    prevProperty: string;
  }) {
    for (let [key, value] of Object.entries(object)) {
      if ((key === 'and' || key === 'or') && Array.isArray(value)) {
        object[key] = value.map((item) =>
          this.handleNestedFilter({
            joinData,
            object: item,
            prevAlias,
            prevProperty,
          }),
        );
      } else {
        if (typeof value === 'object') {
          const checkIfRelation = this.ormService.checkIfRelation([
            prevProperty,
            key,
          ]);
          const properties = this.ormService.getProperties(prevProperty);

          if (!checkIfRelation && !properties.includes(key))
            throw new Error(
              `filter: ${key} không tồn tại bên trong ${prevProperty}`,
            );
          this.queryUtilService.joinRelation({
            joinData,
            condition: [prevProperty, key],
            ifTrue: {
              field: `${prevAlias}.${key}`,
              alias: `${prevAlias}_${key}`,
            },
          });
          const result = this.handleNestedFilter({
            joinData,
            object: value,
            prevAlias: `${prevAlias}_${key}`,
            prevProperty: key,
          });

          if (!object['and']) object['and'] = [];
          object['and'].push(result);
          return result;
        } else {
          //chuyển value về đúng định dạng
          const checkIfNumber =
            typeof Number(value) === 'number' && !isNaN(Number(value));
          if (checkIfNumber) value = Number(value);

          const checkIfArray = this.commonService.isArray(value as string);
          if (checkIfArray) value = JSON.parse(value as string);
          //

          //kiểm tra toán tử hợp lệ
          if (!compareKey[key])
            throw new Error(
              `filter: Compare key không chính xác, compare key có dạng: _eq, _neq_, _lt, _lte, _gt, _gte, _contains, _ncontains, _in, _nin `,
            );

          //tìm cặp many to many relation gần nhất
          let propertiesSplit = prevAlias.split('_');
          let manyToManyRelationPair: string[];
          const isEntity = this.ormService.getEntityFromProperty(prevProperty);
          let property: string = isEntity ? 'id' : prevProperty;
          const uniqueKey = `${property}_${Math.random()}`;

          while (propertiesSplit.length > 1) {
            const length = propertiesSplit.length - 1;
            const checkIfRelation = this.ormService.checkIfRelation([
              propertiesSplit[length - 1],
              propertiesSplit[length],
            ]);
            if (checkIfRelation === 'many-to-many') {
              manyToManyRelationPair = [
                propertiesSplit[length - 1],
                propertiesSplit[length],
              ];
              break;
            }
            propertiesSplit = propertiesSplit.filter(
              (property) => property !== propertiesSplit[length],
            );
          }

          let where = '';

          //nếu có cặp many to many relation thì chỉ check exists của điều kiện
          if (manyToManyRelationPair && manyToManyRelationPair.length > 0) {
            const [joinTable, inverseJoinTable] = manyToManyRelationPair;
            const inverseJoinTableMetadata =
              this.ormService.getEntityFromProperty(inverseJoinTable);
            const metadata = this.ormService
              .getEntityFromProperty(joinTable)
              .manyToManyRelations.find(
                (relation) => relation.type === inverseJoinTableMetadata.target,
              );

            if (metadata) {
              const { junctionEntityMetadata } = metadata;
              const tableName = junctionEntityMetadata.tableName;
              const joinTableColumn = metadata.joinColumns[0].propertyName;
              const inverseJoinTableColumn =
                metadata.inverseJoinColumns[0].propertyName;
              const isMainProperty =
                joinTable === prevAlias.split('_').slice(1).join('');
              let currentAlias: string;
              if (!isMainProperty) {
                const currentAliasIndex = prevAlias
                  .split('_')
                  .indexOf(joinTable);
                currentAlias = prevAlias
                  .split('_')
                  .filter((val, index) => index <= currentAliasIndex)
                  .join('_');
              }

              where += `EXISTS (SELECT 1 FROM ${tableName} sc`;
              if (property !== 'id') {
                const tableNameToJoin = inverseJoinTableMetadata.tableName;
                where += ` LEFT JOIN "${tableNameToJoin}" c ON sc."${inverseJoinTableColumn}" = c.id`;
              }
              where += ` WHERE sc."${joinTableColumn}" = ${currentAlias ? currentAlias : joinTable}.id`;
              if (property !== 'id') {
                where += ` AND`;
                if (key === '_contains' || key === '_ncontains') {
                  where += ` unaccent(c."${property}") ILIKE unaccent(:${uniqueKey})`;
                } else {
                  where += ` c."${property}" = :${uniqueKey}`;
                }
              } else {
                where += ` AND sc."${inverseJoinTableColumn}" ${compareKey[key]}`;
                if (key === '_in' || key === '_nin') {
                  where += ` (:...${uniqueKey})`;
                } else {
                  where += ` :${uniqueKey}`;
                }
              }
              where += ')';
            }
          } else {
            //nếu ko có thì where như bình thường
            const checkIfEntity =
              this.ormService.getEntityFromProperty(prevProperty);
            if (!checkIfEntity)
              prevAlias = prevAlias.split('_').slice(0, -1).join('_');
            if (key === '_contains' || key === '_ncontains') {
              where += `unaccent(`;
            }
            where += `${prevAlias}.${property}`;
            if (key === '_contains' || key === '_ncontains') {
              where += `)`;
            }
            where += ` ${compareKey[key]}`;
            if (key === '_contains' || key === '_ncontains') {
              where += ` unaccent(:${uniqueKey}`;
            } else if (key === '_in' || key === '_nin') {
              where += ` (:...${uniqueKey})`;
            } else {
              where += ` :${uniqueKey}`;
            }
            if (key === '_contains' || key === '_ncontains') {
              where += `)`;
            }
          }

          const variable = {
            [uniqueKey]:
              key === '_contains' || key === '_ncontains'
                ? `%${value}%`
                : value,
          };
          return { where, variable };
        }
      }
    }
    return object;
  }

  handleFilter({
    joinData,
    filter,
    entityName,
  }: {
    joinData: Set<string>;
    filter: any;
    entityName: string;
  }) {
    filter = qs.parse(qs.stringify(filter), { depth: 10 });
    this.handleNestedFilter({
      joinData,
      object: filter,
      prevAlias: entityName,
      prevProperty: entityName,
    });
    const result = [];
    this.mergeConditions(filter, result);
    return result;
  }
}
