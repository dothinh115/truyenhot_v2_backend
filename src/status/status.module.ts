import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Status, StatusSchema } from './schema/status.schema';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Status.name,
        schema: StatusSchema,
      },
    ]),
  ],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
