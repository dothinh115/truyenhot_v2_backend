import { Disabled } from 'src/core/decorators/disabled.decorator';
import { autoSlug } from 'src/core/middlewares/auto-slug.middleware';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @Disabled()
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  handleBeforeInsertAndUpdate() {
    autoSlug(this, { field: 'title' });
  }
}
