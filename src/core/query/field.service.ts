import { Injectable } from '@nestjs/common';
import { OrmService } from './orm.service';
import { QueryUtilService } from './query-util.service';

@Injectable()
export class FieldService {
  constructor(
    private ormService: OrmService,
    private queryUtilService: QueryUtilService,
  ) {}

  handleFields({
    joinData,
    fields,
    entityName,
  }: {
    joinData: Set<string>;
    fields: string[];
    entityName: string;
  }) {
    const fieldData = new Set<string>();
    if (fields.length === 0) {
      const properties = this.ormService.getProperties(entityName);
      if (properties && properties.length > 0) {
        for (const property of properties) {
          this.queryUtilService.joinRelation({
            joinData,
            condition: [entityName, property],
            ifTrue: {
              field: `${entityName}.${property}`,
              alias: `${entityName}_${property}`,
            },
          });

          this.queryUtilService.addProperty({
            fieldData,
            condition: [entityName, property],
            ifTrue: `${entityName}_${property}.id`,
            ifFalse: `${entityName}.${property}`,
          });
        }
      }
      return fieldData;
    } else
      fields.map((field) => {
        if (field.includes('.')) {
          let fieldSplit = field.split('.').filter((x) => x !== '');
          if (field.endsWith('*')) {
            //khi field kết thúc = dấu *, lấy tất cả
            fieldSplit = fieldSplit.filter((x) => x !== '*');
            if (fieldSplit.length > 1) {
              //nếu có nhiều tầng relation
              fieldSplit.reduce((prev, cur, index) => {
                const key = `${index === 0 ? entityName + '_' : ''}${prev ? prev + '_' : ''}${cur}`;
                const prevProp =
                  prev.split('_').slice(-1).join('') || entityName;
                const checkIfRelation = this.ormService.checkIfRelation([
                  prevProp,
                  cur,
                ]);

                if (!checkIfRelation)
                  throw new Error(
                    `fields: ${cur} không tồn tại bên trong ${prevProp}`,
                  );
                fieldData.add(`${key}.id`);
                joinData.add(
                  JSON.stringify({
                    field:
                      index === 0 ? `${entityName}.${cur}` : `${prev}.${cur}`,
                    alias:
                      index === 0 ? `${entityName}_${cur}` : `${prev}_${cur}`,
                  }),
                );
                const properties =
                  index === fieldSplit.length - 1 &&
                  this.ormService.getProperties(cur);
                if (properties && properties.length > 0) {
                  for (const property of properties) {
                    this.queryUtilService.joinRelation({
                      joinData,
                      condition: [cur, property],
                      ifTrue: {
                        field: `${key}.${property}`,
                        alias: `${key}_${property}`,
                      },
                    });
                    this.queryUtilService.addProperty({
                      fieldData,
                      condition: [cur, property],
                      ifTrue: `${key}_${property}.id`,
                      ifFalse: `${key}.${property}`,
                    });
                  }
                }
                return key;
              }, '');
            } else {
              const field = fieldSplit.join('');

              const checkIfRelation = this.ormService.checkIfRelation([
                entityName,
                field,
              ]);
              if (!checkIfRelation)
                throw new Error(
                  `fields: ${field} không tồn tại bên trong ${entityName}`,
                );
              //nếu có 1 tầng relation
              const properties = this.ormService.getProperties(field);

              if (properties.length > 0) {
                for (const property of properties) {
                  this.queryUtilService.joinRelation({
                    joinData,
                    condition: [field, property],
                    ifFalse: {
                      field: `${entityName}.${field}`,
                      alias: `${entityName}_${field}`,
                    },
                    ifTrue: {
                      field: `${entityName}_${field}.${property}`,
                      alias: `${entityName}_${field}_${property}`,
                    },
                  });
                  this.queryUtilService.addProperty({
                    fieldData,
                    condition: [field, property],
                    ifTrue: `${entityName}_${field}_${property}.id`,
                    ifFalse: `${entityName}_${field}.${property}`,
                  });
                }
              }
            }
          } else {
            fieldSplit.reduce((prev, cur, index) => {
              const key = `${index === 0 ? entityName + '_' : ''}${prev ? prev + '_' : ''}${cur}`;
              const prevProp = prev.split('_').slice(-1).join('') || entityName;

              if (index !== fieldSplit.length - 1) {
                const checkIfRelation = this.ormService.checkIfRelation([
                  prevProp,
                  cur,
                ]);
                if (!checkIfRelation)
                  throw new Error(
                    `fields: ${cur} không tồn tại bên trong ${prevProp}`,
                  );
                joinData.add(
                  JSON.stringify({
                    field:
                      index === 0 ? `${entityName}.${cur}` : `${prev}.${cur}`,
                    alias:
                      index === 0 ? `${entityName}_${cur}` : `${prev}_${cur}`,
                  }),
                );
                fieldData.add(`${key}.id`);
              } else {
                const properties = this.ormService.getProperties(prevProp);
                if (!properties.includes(cur))
                  throw new Error(
                    `fields: ${cur} không tồn tại bên trong ${prevProp}`,
                  );
                this.queryUtilService.joinRelation({
                  joinData,
                  condition: [fieldSplit[index - 1], cur],
                  ifTrue: {
                    field: `${prev}.${cur}`,
                    alias: `${prev}_${cur}`,
                  },
                });

                this.queryUtilService.addProperty({
                  fieldData,
                  condition: [fieldSplit[index - 1], cur],
                  ifTrue: `${prev}_${cur}.id`,
                  ifFalse: `${prev}.${cur}`,
                });
              }
              return key;
            }, '');
          }
        } else {
          if (field === '*') {
            const properties = this.ormService.getProperties(entityName);
            if (properties && properties.length > 0) {
              for (const property of properties) {
                this.queryUtilService.joinRelation({
                  joinData,
                  condition: [entityName, property],
                  ifTrue: {
                    field: `${entityName}.${property}`,
                    alias: `${entityName}_${property}`,
                  },
                });

                this.queryUtilService.addProperty({
                  fieldData,
                  condition: [entityName, property],
                  ifTrue: `${entityName}_${property}.id`,
                  ifFalse: `${entityName}.${property}`,
                });
              }
            }
            return fieldData;
          }
          //check xem trường muốn lấy có phải là relation của repo chính hay ko
          const checkIfRelation = this.ormService.checkIfRelation([
            entityName,
            field,
          ]);
          const properties = this.ormService.getProperties(entityName);
          if (!checkIfRelation && !properties.includes(field))
            throw new Error(
              `fields: ${field} không tồn tại bên trong ${entityName}`,
            );
          this.queryUtilService.joinRelation({
            joinData,
            condition: [entityName, field],
            ifTrue: {
              field: `${entityName}.${field}`,
              alias: `${entityName}_${field}`,
            },
          });
          this.queryUtilService.addProperty({
            fieldData,
            condition: [entityName, field],
            ifTrue: `${entityName}_${field}.id`,
            ifFalse: `${entityName}.${field}`,
          });
        }
      });
    return fieldData;
  }
}
