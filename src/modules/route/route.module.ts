import { Global, Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Route, RouteSchema } from './schema/route.schema';

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
