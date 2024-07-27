import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateChapterDto {
  @Expose()
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @Expose()
  @IsNotEmpty({ message: 'title không được để trống' })
  title: string;

  @Expose()
  @IsNotEmpty({ message: 'content không được để trống' })
  content: string;

  @Expose()
  @IsNotEmpty({ message: 'story không được để trống' })
  story: number;
}
