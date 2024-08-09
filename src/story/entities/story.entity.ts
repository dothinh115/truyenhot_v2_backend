import { Author } from 'src/author/entities/author.entity';
import { Category } from 'src/category/entities/category.entity';
import { ColumnType } from 'src/core/decorators/column-type.decorator';
import { Disabled } from 'src/core/decorators/disabled.decorator';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum StatusType {
  CONTINUE = 'Đang ra',
  FULL = 'Full',
}

@Entity()
@Index(['author'])
export class Story extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @Disabled()
  slug: string;

  @Column({ nullable: false })
  @ColumnType('richText')
  description: string;

  @Column({ default: 0 })
  @Disabled()
  view: number;

  @Column({ default: 'Sưu tầm' })
  source: string;

  @Column({ default: StatusType.CONTINUE, type: 'varchar' })
  status: StatusType;

  @Column({ default: null })
  cover: string | null;

  @ManyToOne(() => Author, (author) => author.id, { nullable: false })
  @JoinColumn()
  author: Author;

  @ManyToMany(() => Category, { cascade: true, eager: true, nullable: false })
  @JoinTable()
  categories: Category[];
}
