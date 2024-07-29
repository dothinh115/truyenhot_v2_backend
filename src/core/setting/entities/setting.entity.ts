import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Role } from 'src/core/role/entities/role.entity';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @OneToOne(() => Role, { eager: true })
  @JoinColumn()
  defaultRole: Role;
}
