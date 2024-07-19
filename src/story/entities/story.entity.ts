import { Author } from 'src/author/entities/author.entity';
import { Category } from 'src/category/entities/category.entity';
import { autoSlug } from 'src/core/middlewares/auto-slug.middleware';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum StatusType {
  CONTINUE = 'Đang ra',
  FULL = 'Full',
}

@Entity()
@Index(['author'])
export class Story {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  slug: string;

  @Column({ nullable: false })
  description: string;

  @Column({ default: 0 })
  view: number;

  @Column({ default: 'Sưu tầm' })
  source: string;

  @Column({ default: StatusType.CONTINUE, type: 'enum', enum: StatusType })
  status: StatusType;

  @Column({ default: null })
  cover: string | null;

  @ManyToOne(() => Author, (author) => author.id)
  @JoinColumn()
  author: Author;

  @ManyToMany(() => Category, { cascade: true, eager: true })
  @JoinTable()
  categories: Category[];

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
