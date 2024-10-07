import { AutoGenerated } from 'src/core/decorators/auto-generated.decorator';
import { BaseEntity } from 'src/core/typeorm/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  @AutoGenerated()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  @AutoGenerated()
  slug: string;
}
