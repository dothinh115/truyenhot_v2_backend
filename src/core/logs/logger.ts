import { ConsoleLogger, Injectable } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogLevel } from './entities/log.entity';

@Injectable()
export class MyLogger extends ConsoleLogger {
  constructor(private logsService: LogsService) {
    super();
  }
  log(message: unknown, context?: unknown): void {}

  debug(message: unknown, context?: unknown): void {}

  async warn(message: string, context: string) {
    await this.logsService.create(
      {
        level: LogLevel.WARN,
        context: context ?? '',
        message: message ?? '',
      },
      {},
    );
    super.warn(message, context);
  }

  async error(message: string, context: string) {
    await this.logsService.create(
      {
        level: LogLevel.ERROR,
        context: context ?? '',
        message: message ?? '',
      },
      {},
    );
    super.error(message, context);
  }
}
