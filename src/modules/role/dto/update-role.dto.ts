import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @Expose()
  @IsNotEmpty({ message: 'Title không được để trống!' })
  title: string;
}
