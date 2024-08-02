import { Disabled } from 'src/core/decorators/disabled.decorator';
import { autoSlug } from 'src/core/middlewares/auto-slug.middleware';
import { Route } from 'src/core/route/entities/route.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Role {
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  handleBeforeInsertAndUpdate() {
    autoSlug(this);
  }
}
