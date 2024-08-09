import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Role } from 'src/core/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @OneToOne(() => Role, { eager: true })
  @JoinColumn()
  defaultRole: Role;

  @Column({ nullable: false, default: true })
  duplicateFileCheck: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
