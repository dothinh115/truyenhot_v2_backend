import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @Expose()
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'Password không được để trống!' })
  password: string;
}
