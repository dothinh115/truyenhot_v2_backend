import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { StatusType } from '../entities/story.entity';

export class CreateStoryDto {
  @Expose()
  @IsNotEmpty({ message: 'title không được để trống!' })
  title: string;

  @Expose()
  @IsNotEmpty({ message: 'description không được để trống!' })
  description: string;

  @Expose()
  @IsNotEmpty({ message: 'author không được để trống!' })
  author: string;

  @Expose()
  source?: string;

  @Expose()
  status?: StatusType;

  @Expose()
  @IsNotEmpty({ message: 'categories không được để trống!' })
  categories: number[];

  @Expose()
  cover?: string;
}
