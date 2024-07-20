import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateFolderDto {
  @Expose()
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;
}
