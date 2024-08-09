import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Route } from 'src/core/route/entities/route.entity';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @Disabled()
  slug: string;

  @ManyToMany(() => Route)
  @JoinTable({
    name: 'route_roles_role',
  })
  routes: Route[];
}
