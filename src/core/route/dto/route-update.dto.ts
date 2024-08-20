import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateRouteDto {
  @Expose()
  @IsOptional()
  roles: number[];

  @Expose()
  @IsOptional()
  isHidden: boolean;
}
