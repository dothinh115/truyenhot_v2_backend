import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ClusterService } from './core/common/cluster.service';

async function bootstrap(PORT: number) {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(express.static('.'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(PORT);
  console.log('App listened on PORT ' + PORT);
}
ClusterService.clusterize(bootstrap);
// bootstrap();
