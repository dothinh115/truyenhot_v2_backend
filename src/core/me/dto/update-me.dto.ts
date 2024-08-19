import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateMeDto {
  @Expose()
  @IsOptional()
  password: string;
}
