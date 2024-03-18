import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './role.guard';

@Global()
@Module({
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class RoleGuardModule {}
