import { ColumnType } from 'src/core/decorators/column-type.decorator';
import { Disabled } from 'src/core/decorators/disabled.decorator';
import { autoSlug } from 'src/core/middlewares/auto-slug.middleware';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import { Story } from 'src/story/entities/story.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Index(['story', 'slug', 'name'])
@Unique(['story', 'slug'])
export class Chapter extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  @Disabled()
  slug: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @ColumnType('richText')
  content: string;

  @Index()
  @ManyToOne(() => Story, (story) => story.id)
  @JoinColumn()
  story: Story;

  @BeforeInsert()
  @BeforeUpdate()
  handleAutoSlug() {
    autoSlug(this, { field: 'name' });
  }
}
