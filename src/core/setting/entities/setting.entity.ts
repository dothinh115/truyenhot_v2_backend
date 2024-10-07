import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Role } from 'src/core/role/entities/role.entity';
import { BaseEntity } from 'src/core/typeorm/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @OneToOne(() => Role, { eager: true })
  @JoinColumn()
  defaultRole: Role;

  @Column({ nullable: false, default: true })
  duplicateFileCheck: boolean;
}
