import { Global, Module } from '@nestjs/common';
import { PermissionGuard } from './permission.guard';

@Global()
@Module({
  providers: [PermissionGuard],
  exports: [PermissionGuard],
})
export class GuardModule {}
