import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendMailDto {
  @Expose()
  @IsNotEmpty({ message: 'From không được để trống!' })
  from: string;

  @Expose()
  @IsNotEmpty({ message: 'To không được để trống!' })
  @IsEmail({}, { message: 'To phải là email!' })
  to: string;

  @Expose()
  @IsNotEmpty({ message: 'Subject không được để trống!' })
  subject: string;

  @Expose()
  @IsNotEmpty({ message: 'HTML không được để trống!' })
  html: string;
}
