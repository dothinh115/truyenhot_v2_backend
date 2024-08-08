import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateFileLimitDto {
  @Expose()
  @IsNotEmpty({ message: 'maxSize không được để trống!' })
  maxSize: number;
}
