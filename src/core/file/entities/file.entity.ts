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
import { Folder } from 'src/core/folder/entities/folder.entity';
import { EFileType } from '../../file-limit/entities/file-limit.entity';
import { Disabled } from 'src/core/decorators/disabled.decorator';

export enum FileExtension {
  JPEG = '.jpeg',
  PNG = '.png',
  GIF = '.gif',
  WEBP = '.webp',
  JPG = '.jpg',

  MP3 = '.mp3',
  WAV = '.wav',

  MP4 = '.mp4',

  PDF = '.pdf',
  ZIP = '.zip',
  XLXS = '.xlsx',
}

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  @Disabled()
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  @Disabled()
  mimeType: EFileType;

  @Column({ nullable: false })
  @Disabled()
  originalName: string;

  @Column({ nullable: false })
  @Disabled()
  size: number;

  @Column()
  hash: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @Disabled()
  user: User;

  @ManyToOne(() => Folder, (folder) => folder.id, { eager: true })
  @JoinColumn()
  @Disabled()
  folder: Folder;

  @Column({ nullable: false, type: 'varchar' })
  extension: FileExtension;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
