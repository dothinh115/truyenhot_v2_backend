import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class OAuthLoginDto {
  @Expose()
  @IsNotEmpty({ message: 'clientId không được để trống!' })
  clientId: string;
}
