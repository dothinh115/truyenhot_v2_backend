import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateStatusDto {
  @Expose()
  @IsNotEmpty({ message: 'title không được để trống!' })
  title: string;
}
