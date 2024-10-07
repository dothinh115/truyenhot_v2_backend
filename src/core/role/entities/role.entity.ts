import { AutoGenerated } from 'src/core/decorators/auto-generated.decorator';
import { Route } from 'src/core/route/entities/route.entity';
import { BaseEntity } from 'src/core/typeorm/entities/base.entity';
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
  @AutoGenerated()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @AutoGenerated()
  slug: string;

  @ManyToMany(() => Route)
  @JoinTable({
    name: 'route_roles_role',
  })
  routes: Route[];
}
