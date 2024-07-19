import { Role } from 'src/core/role/entities/role.entity';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Role, { eager: true })
  @JoinColumn()
  defaultRole: Role;
}
