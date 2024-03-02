import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateStoryDto {
  @Expose()
  @IsNotEmpty({ message: 'title không được để trống!' })
  title: string;

  @Expose()
  @IsNotEmpty({ message: 'category không được để trống!' })
  category: number[];

  @Expose()
  @IsNotEmpty({ message: 'author không được để trống!' })
  author: number;

  @Expose()
  status: number;

  @Expose()
  description: string;

  @Expose()
  source: string;
}
