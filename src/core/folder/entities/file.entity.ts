import { User } from 'src/core/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Folder } from './folder.entity';
import { ColumnType } from 'src/core/decorators/column-type.decorator';

export enum FileType {
  IMG_JPEG = 'image/jpeg',
  IMG_PNG = 'image/png',
  IMG_GIF = 'image/gif',
  IMG_WEBP = 'image/webp',

  AUDIO_MP3 = 'audio/mpeg',
  AUDIO_WAV = 'audio/wav',

  VIDEO_MP4 = 'video/mp4',

  APP_PDF = 'application/pdf',
  APP_ZIP = 'application/zip',
}

export enum FileExtension {
  JPEG = 'jpeg',
  png = 'png',
  GIF = 'gif',
  WEBP = 'webp',

  MP3 = 'mp3',
  WAV = 'wav',

  MP4 = 'mp4',

  PDF = 'pdf',
  zip = 'zip',
}

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'enum', enum: FileType })
  @ColumnType('string')
  mimeType: FileType;

  @Column({ nullable: false })
  originalName: string;

  @Column({ nullable: false })
  size: number;

  @OneToMany(() => User, (user) => user.id, { eager: true })
  user: User;

  @ManyToOne(() => Folder, { eager: true })
  @JoinColumn()
  folder: Folder;

  @Column({ nullable: false, type: 'enum', enum: FileExtension })
  @ColumnType('string')
  extension: FileExtension;
}
