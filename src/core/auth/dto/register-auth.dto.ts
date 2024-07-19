import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RegisterAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'email không được để trống!' })
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'password không được để trống!' })
  password: string;
}
