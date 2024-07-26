import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: null })
  clientId: string;

  @Column({ nullable: false })
  expiredDate: Date;
}
