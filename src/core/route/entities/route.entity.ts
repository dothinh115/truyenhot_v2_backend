import { Role } from 'src/core/role/entities/role.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum MethodType {
  POST = 'POST',
  GET = 'GET',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

@Entity()
@Unique(['path', 'method'])
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false, type: 'enum', enum: MethodType })
  method: MethodType;

  @Column({ nullable: false, default: false })
  isProtected: boolean;

  @ManyToMany(() => Role, { cascade: true, eager: true })
  @JoinTable({
    name: 'route_roles_role',
  })
  roles: Role[];
}
