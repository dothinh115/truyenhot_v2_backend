import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { LogLevel } from '../entities/log.entity';

export class CreateLogDto {
  @Expose()
  @IsNotEmpty({ message: 'level không được để trống!' })
  level: LogLevel;

  @Expose()
  @IsNotEmpty({ message: 'message không được để trống!' })
  message: string;

  @Expose()
  @IsNotEmpty({ message: 'context không được để trống!' })
  context: string;
}
