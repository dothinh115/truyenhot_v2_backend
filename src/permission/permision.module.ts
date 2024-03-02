import { Global, Module } from '@nestjs/common';
import { PermisionService } from './permision.service';
import { PermisionController } from './permision.controller';
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
  controllers: [PermisionController],
  providers: [PermisionService],
  exports: [MongooseModule],
})
export class PermisionModule {}
