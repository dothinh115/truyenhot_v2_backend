import { Disabled } from 'src/core/decorators/disabled.decorator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EFileType {
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

@Entity()
export class FileLimit {
  @PrimaryGeneratedColumn()
  @Disabled()
  id: number;

  @Column({ nullable: false, type: 'enum', enum: EFileType })
  @Disabled()
  fileType: EFileType;

  @Column()
  maxSize: number;
}
