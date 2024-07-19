import { autoHashPassword } from 'src/core/middlewares/auto-hash-password.middleware';
import { Role } from 'src/core/role/entities/role.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ default: false })
  rootUser: boolean;

  @ManyToOne(() => Role, (role) => role.id, { eager: true })
  role: Role;

  @BeforeInsert()
  @BeforeUpdate()
  handleBeforeInsertAndUpdate() {
    autoHashPassword(this);
  }
}
