import { autoSlug } from 'src/core/middlewares/auto-slug.middleware';
import { Route } from 'src/core/route/entities/route.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  slug: string;

  @ManyToMany(() => Route)
  @JoinTable({
    name: 'route_roles_role',
  })
  routes: Route[];

  @BeforeInsert()
  @BeforeUpdate()
  handleBeforeInsertAndUpdate() {
    autoSlug(this);
  }
}
