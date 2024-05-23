import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Expose } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Expose()
  role: string;
}
