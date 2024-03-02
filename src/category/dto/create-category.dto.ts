import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @Expose()
  @IsNotEmpty({ message: 'title không được để trống!' })
  title: string;
}
