import { ColumnType } from 'src/core/decorators/column-type.decorator';
import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Role } from 'src/core/role/entities/role.entity';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum MethodType {
  POST = 'POST',
  GET = 'GET',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

@Entity()
@Unique(['path', 'method'])
export class Route extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false })
  @Disabled()
  path: string;

  @Column({ nullable: false, type: 'varchar' })
  @Disabled()
  method: MethodType;

  @Column({ nullable: false, default: false })
  @Disabled()
  isProtected: boolean;

  @ManyToMany(() => Role, { cascade: true, eager: true })
  @JoinTable({
    name: 'route_roles_role',
  })
  roles: Role[];
}
