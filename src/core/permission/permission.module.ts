import { Global, Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schema/permission.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [MongooseModule],
})
export class PermissionModule {}
