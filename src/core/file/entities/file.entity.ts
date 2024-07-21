import { User } from 'src/core/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColumnType } from 'src/core/decorators/column-type.decorator';
import { Folder } from 'src/core/folder/entities/folder.entity';
import { EFileType } from './file-limit.entity';

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
  zip = '.zip',
}

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'enum', enum: EFileType })
  @ColumnType('string')
  mimeType: EFileType;

  @Column({ nullable: false })
  originalName: string;

  @Column({ nullable: false })
  size: number;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  user: User;

  @ManyToOne(() => Folder, (folder) => folder.id, { eager: true })
  @JoinColumn()
  folder: Folder;

  @Column({ nullable: false, type: 'enum', enum: FileExtension })
  @ColumnType('string')
  extension: FileExtension;
}
