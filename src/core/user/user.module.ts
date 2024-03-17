import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { HandlerModule } from '../handler/handler.module';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    HandlerModule.register([
      {
        route: 'user',
        provider: UserService,
      },
    ]),
  ],
  exports: [MongooseModule, HandlerModule],
})
export class UserModule {}
