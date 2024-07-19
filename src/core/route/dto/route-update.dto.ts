import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateRouteDto {
  @Expose()
  @IsNotEmpty({ message: 'roles không được để trống' })
  roles: number[];
}
