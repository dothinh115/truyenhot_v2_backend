import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schema/role.schema';
import { HandlerModule } from '../handler/handler.module';
import { RoleService } from './role.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Role.name,
        schema: RoleSchema,
      },
    ]),
    HandlerModule.register([{ route: 'role', provider: RoleService }]),
  ],
  exports: [MongooseModule],
})
export class RoleModule {}
