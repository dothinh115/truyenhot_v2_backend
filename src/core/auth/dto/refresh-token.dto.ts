import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @Expose()
  @IsNotEmpty({ message: 'refreshToken không thể để trống!' })
  refreshToken: string;
}
