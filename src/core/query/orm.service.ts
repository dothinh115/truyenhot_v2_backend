import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityMetadata, In, Repository } from 'typeorm';

@Injectable()
export class OrmService {
  constructor(@InjectEntityManager() private manager: EntityManager) {}
  getEntityFromProperty(property: string): EntityMetadata | undefined {
    const entities = this.manager.connection.entityMetadatas;
    for (const entity of entities) {
      if (entity.name.toLowerCase() === property.toLowerCase()) {
        return entity;
      }

      const relation = entity.relations.find(
        (rel) => rel.propertyName === property,
      );
      if (relation) {
        return this.manager.connection.entityMetadatas.find(
          (meta) => meta.target === relation.type,
        );
      }
    }
    return undefined;
  }

  checkIfRelation(fields: [string, string]) {
    let relationOfProperty: EntityMetadata = this.getEntityFromProperty(
      fields[0],
    );
    const find = relationOfProperty?.relations.find(
      (relation) => relation.propertyName === fields[1],
    );
    if (find) {
      return find.relationType;
    }
    return null;
  }

  getProperties(entityName: string): string[] {
    // Lấy metadata của entity từ tên của nó
    const entityMetadata = this.getEntityFromProperty(entityName);
    const properties = entityMetadata.columns.map(
      (column) => column.propertyName,
    );

    // Xử lý các quan hệ
    entityMetadata.relations.forEach((relation) => {
      if (
        relation.isOneToMany ||
        relation.isManyToOne ||
        (relation.isManyToMany && relation.joinTableName)
      ) {
        properties.push(relation.propertyName);
      }
    });

    return properties;
  }

  async checkIfReferenced(repository: Repository<any>, id: string | number) {
    const entities = this.manager.connection.entityMetadatas;
    const checks = entities.map(async (entity) => {
      const relations = entity.relations;
      for (const relation of relations) {
        if (relation.type === repository.metadata.target) {
          const currentRepo = this.manager.connection.getRepository(
            entity.target,
          );
          const foreignKey = relation.propertyName;
          const referencedCount = await currentRepo.count({
            where: {
              [foreignKey]: {
                id: relation.isManyToMany ? In([id]) : id,
              },
            },
          });
          if (referencedCount > 0) {
            throw new Error(
              `Không thể xoá bản ghi vì có tham chiếu từ ${entity.name.toLowerCase()}.${foreignKey}`,
            );
          }
        }
      }
    });
    await Promise.all(checks);
  }

  getRelationEntityName(entity: Function | string, propertyName: string) {
    const entities = this.manager.connection.entityMetadatas;
    const relation = entities
      .map((ent) => {
        return ent.relations.find(
          (relation) =>
            relation.type === entity && relation.propertyName === propertyName,
        );
      })
      .filter((x) => x !== undefined)[0];

    if (relation && typeof relation.type === 'function') {
      const relatedEntityName = relation.type.name.toLowerCase();
      return relatedEntityName;
    }
    return null;
  }
}
