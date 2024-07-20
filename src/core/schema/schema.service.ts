import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { getAllMetadata } from '../utils/metadata.util';
import { OrmService } from '../query/orm.service';

@Injectable()
export class SchemaService {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    private ormService: OrmService,
  ) {}
  findOne(entityName: string) {
    try {
      const entity = this.manager.connection.entityMetadatas.find(
        (metadata) => metadata.name.toLowerCase() === entityName.toLowerCase(),
      );
      if (!entity) throw new Error('Không có schema này');
      const schema = {};
      for (const column of entity.columns) {
        if (
          column.propertyName === 'createdAt' ||
          column.propertyName === 'updatedAt'
        )
          continue;
        const metadata = getAllMetadata(
          (entity.target as Function).prototype,
          column.propertyName,
        );
        let type =
          typeof column.type === 'function'
            ? column.type.name.toLowerCase()
            : column.type;
        if (type === 'uuid') type = 'string';
        schema[column.propertyName] = {
          type,
          required: column.isNullable ? false : true,
          ...(column.relationMetadata && {
            relation: this.ormService.getRelationEntityName(
              column.relationMetadata.type,
              column.relationMetadata.propertyName,
            ),
          }),
          ...(column.default && {
            default: column.default,
          }),
          ...metadata,
        };
      }
      for (const relation of entity.relations) {
        if (relation.isManyToMany) {
          const metadata = getAllMetadata(
            (entity.target as Function).prototype,
            relation.propertyName,
          );
          schema[relation.propertyName] = {
            type: 'array',
            relation: this.ormService.getRelationEntityName(
              relation.type,
              relation.propertyName,
            ),
            ...metadata,
          };
        }
      }

      return { data: schema };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
