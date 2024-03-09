import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateFolderDto {
  @Expose()
  @IsNotEmpty({ message: 'Title không được để trống!' })
  title: string;
}
