import { Disabled } from 'src/core/decorators/disabled.decorator';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @Disabled()
  slug: string;
}
