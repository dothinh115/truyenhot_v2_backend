import {
  CallHandler,
  ExecutionContext,
  HttpException,
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
    const now = new Date().toISOString();
    const contextName = `<br><br>[${now}] [${method}]: ${url}<br>[User: ${userId}]`;

    return next.handle().pipe(
      catchError((err) => {
        let statusCode = 500;

        if (err instanceof HttpException) {
          statusCode = err.getStatus();
        }
        if (statusCode === 401) return throwError(() => err);
        this.logger.error(err.message, `${err.stack}${contextName}`);
        return throwError(() => err);
      }),
    );
  }
}
