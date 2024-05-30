import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Route, RouteSchema } from './schema/route.schema';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Route.name,
        schema: RouteSchema,
      },
    ]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [MongooseModule],
})
export class RouteModule {}
