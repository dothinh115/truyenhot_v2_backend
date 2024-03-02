import { Expose } from 'class-transformer';
import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class CreateChapterDto {
  @Expose()
  @IsNotEmpty({ message: 'story không được để trống!' })
  story: number;

  @Expose()
  @IsNotEmpty({ message: 'name không được để trống!' })
  name: string;

  @Expose()
  title: string;

  @Expose()
  @IsNotEmpty({ message: 'content không được để trống!' })
  content: string;
}
