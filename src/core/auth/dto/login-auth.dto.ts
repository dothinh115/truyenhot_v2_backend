import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'email không được để trống!' })
  @IsEmail()
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'password không được để trống!' })
  password: string;

  @Expose()
  @IsNotEmpty({ message: 'clientId không được để trống!' })
  clientId: string;
}
