import { Expose } from 'class-transformer';

export class UpdatePermisionDto {
  @Expose()
  roles: any[];
}
