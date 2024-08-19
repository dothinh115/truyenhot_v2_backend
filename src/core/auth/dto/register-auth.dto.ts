import { Expose } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'email không được để trống!' })
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'password không được để trống!' })
  @MinLength(6, { message: 'password tối thiểu 6 ký tự!' })
  password: string;

  @Expose()
  @IsNotEmpty({ message: 'username không được để trống!' })
  @MinLength(6, { message: 'user tối thiểu 6 ký tự!' })
  username: string;
}
