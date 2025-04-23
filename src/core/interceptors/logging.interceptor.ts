import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const userId = req.user?.id || 'Guest';
    const contextName = `<br><br>[${method}]: ${url}<br>[User: ${userId}]`;

    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(err.message, `\n${err.stack}\n${contextName}`);
        return throwError(() => err);
      }),
    );
  }
}
