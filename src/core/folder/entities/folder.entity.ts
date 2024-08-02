import { Disabled } from 'src/core/decorators/disabled.decorator';
import { User } from 'src/core/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  @Disabled()
  user: User;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt:Date
}
