import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/schema/user.schema';
import {
  Permission,
  PermissionSchema,
} from 'src/modules/permission/schema/permission.schema';
import { Role, RoleSchema } from 'src/modules/role/schema/role.schema';
import { BoostrapService, OnBootStrapService } from './bootstrap.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
    ]),
  ],
  providers: [OnBootStrapService, BoostrapService],
  exports: [OnBootStrapService],
})
export class BootstrapModule {}
