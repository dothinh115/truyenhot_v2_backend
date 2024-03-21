import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class LoginAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail()
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'Password không được để trống!' })
  password: string;
}
