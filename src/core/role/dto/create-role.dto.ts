import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @Expose()
  @IsNotEmpty({ message: 'title không được để trống' })
  title: string;

  @Expose()
  @IsOptional()
  routes?: number[];
}
