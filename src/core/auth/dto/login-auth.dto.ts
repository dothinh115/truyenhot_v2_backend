import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import settings from '@/settings.json';
export class LoginAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail()
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'Password không được để trống!' })
  password: string;

  @ValidateIf(() => settings.AUTH.BROWSER_ID_CHECK)
  @Expose()
  @IsNotEmpty({ message: 'browserId không được để trống!' })
  browserId?: string;
}
