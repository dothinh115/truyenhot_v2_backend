import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class LogoutAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'refreshToken không được để trống!' })
  refreshToken: string;
}
