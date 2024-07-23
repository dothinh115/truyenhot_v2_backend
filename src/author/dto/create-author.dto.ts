import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateAuthorDto {
  @Expose()
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;
}
