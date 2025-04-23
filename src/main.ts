import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TruncateLongStringsInterceptor } from './core/interceptors/truncate-long-strings.interceptor';
import { ResponseInterceptor } from './core/interceptors/response.intercepter';
import { MyLogger } from './core/logs/logger';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

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
        logLevels: ['error', 'warn'],
      }),
    },
  );
  app.register(require('@fastify/multipart'));
  // app.useGlobalInterceptors(new TruncateLongStringsInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(MyLogger)));

  app.enableCors({
    origin: '*',
  });

  const logger = app.get(Logger);

  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(4567);
}

bootstrap();
