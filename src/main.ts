import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TruncateLongStringsInterceptor } from './core/interceptors/truncate-long-strings.interceptor';
import { ResponseInterceptor } from './core/interceptors/response.intercepter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      connectionTimeout: 120000,
      logger: true,
    }),
    {
      logger: new ConsoleLogger({
        json: true,
        colors: true,
      }),
    },
  );
  app.register(require('@fastify/multipart'));
  app.useGlobalInterceptors(new TruncateLongStringsInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(4567);
}

bootstrap();
