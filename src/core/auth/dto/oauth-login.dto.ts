import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class OAuthLoginDto {
  @Expose()
  @IsNotEmpty({ message: 'redirectTo không được để trống!' })
  redirectTo: string;
}
