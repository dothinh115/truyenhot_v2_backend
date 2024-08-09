import { BaseEntity } from 'src/core/typeorm/base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Index(['refreshToken', 'clientId'])
@Unique(['refreshToken', 'clientId'])
export class RefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: null })
  clientId: string;

  @Column({ nullable: false })
  expiredDate: Date;

  @Column({ default: 0 })
  refreshCount: number;
}
