import { File } from 'buffer';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateFileDto {
  @Expose()
  @IsNotEmpty({ message: 'files không được để trống' })
  files: File;
}
