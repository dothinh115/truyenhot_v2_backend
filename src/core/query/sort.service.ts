import { BadRequestException, Injectable } from '@nestjs/common';
import { OrmService } from './orm.service';

@Injectable()
export class SortService {
  constructor(private ormService: OrmService) {}

  handleSort({
    joinData,
    sort,
    entityName,
  }: {
    joinData: Set<string>;
    sort: string[];
    entityName: string;
  }) {
    let sortArr: {
      field: string;
      type: 'ASC' | 'DESC';
    }[] = [];
    const result: {
      field: string;
      type: 'ASC' | 'DESC';
    }[] = [];

    sort.map((sortItem) => {
      let sortData: {
        field: string;
        type: 'ASC' | 'DESC';
      } = { field: '', type: 'ASC' };
      if (sortItem.startsWith('-')) {
        //nếu sort có chứa dấu - phía trước thì phải sort theo DESC
        sortData.field = sortItem.split('-').join('');
        sortData.type = 'DESC';
      } else {
        sortData.field = sortItem;
        sortData.type = 'ASC';
      }
      sortArr.push(sortData);
    });

    if (sortArr.length > 0) {
      sortArr.map((item) => {
        if (item.field.includes('.')) {
          const fieldSplit = item.field.split('.').filter((x) => x !== '');
          fieldSplit.reduce((prev, cur, index) => {
            const key = `${index === 0 ? `${entityName}_` : ''}${prev ? `${prev}_` : ''}${cur}`;
            const prevProp = prev.split('_').slice(-1).join('') || entityName;
            const checkIfRelation = this.ormService.checkIfRelation([
              prevProp,
              cur,
            ]);
            if (index !== fieldSplit.length - 1) {
              if (!checkIfRelation) {
                throw new BadRequestException(
                  `sort: ${cur} không tồn tại bên trong ${prevProp}`,
                );
              }

              joinData.add(
                JSON.stringify({
                  field:
                    index === 0 ? `${entityName}.${cur}` : `${prev}.${cur}`,
                  alias:
                    index === 0 ? `${entityName}_${cur}` : `${prev}_${cur}`,
                }),
              );
            } else {
              let sortData: any = {};
              if (checkIfRelation) {
                joinData.add(
                  JSON.stringify({
                    field: `${prev}.${cur}`,
                    alias: `${prev}_${cur}`,
                  }),
                );
                sortData = {
                  field: `${prev}_${cur}.id`,
                  type: item.type,
                };
              } else {
                const properties = this.ormService.getProperties(prevProp);
                const isInvalidProperty = properties.includes(cur);
                if (!isInvalidProperty)
                  throw new BadRequestException(
                    `sort: ${cur} không tồn tại bên trong ${prevProp}`,
                  );
                sortData = {
                  field: `${prev}.${cur}`,
                  type: item.type,
                };
              }
              result.push(sortData);
            }
            return key;
          }, '');
        } else {
          const properties = this.ormService.getProperties(entityName);
          const isInvalidProperty = properties.includes(item.field);
          if (!isInvalidProperty)
            throw new BadRequestException(
              `sort: ${item.field} không tồn tại bên trong ${entityName}`,
            );
          result.push({
            field: `${entityName}.${item.field}`,
            type: item.type,
          });
        }
      });
    }
    return result;
  }
}
