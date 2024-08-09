import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Role } from 'src/core/role/entities/role.entity';
import { BaseEntity } from 'src/core/typeorm/base.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @Column({ nullable: false, unique: true })
  @Disabled()
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ default: false })
  @Disabled()
  rootUser: boolean;

  @ManyToOne(() => Role, (role) => role.id, { eager: true })
  role: Role;
}
