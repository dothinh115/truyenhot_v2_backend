import { Disabled } from 'src/core/decorators/disabled.decorator';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import { User } from 'src/core/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Folder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  @Disabled()
  user: User;
}
