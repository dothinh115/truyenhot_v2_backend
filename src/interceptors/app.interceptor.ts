import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class AppInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const { query } = context.switchToHttp().getRequest();
    const fullArr =
      query.full?.split(',').filter((x: string) => x !== '') ?? [];

    return next.handle().pipe(
      map((res) => {
        if (!query.full?.includeds('*')) {
          res.data = truncateLongStrings(res.data.data, fullArr, 200);
        }
        return res;
      }),
    );
  }
}

function truncateLongStrings(
  dataArray: any[],
  excludedFields: string[] = [],
  maxLength: number = 200,
): any[] {
  return dataArray.map((item) => {
    if (typeof item === 'object' && item !== null) {
      const result: any = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const value = item[key];

          // Kiểm tra nếu trường lồng nhau nằm trong excludedFields
          const isExcluded = excludedFields.some((excluded) => {
            const fieldParts = excluded.split('.'); // Tách tên trường theo dấu '.'
            return fieldParts[0] === key; // So sánh với trường cha
          });

          if (isExcluded) {
            result[key] = value; // Không cắt ngắn
            continue; // Bỏ qua cắt ngắn cho trường này
          }

          // Nếu giá trị là Date, chuyển đổi về chuỗi
          if (value instanceof Date) {
            result[key] = value.toISOString(); // Chuyển đổi Date thành chuỗi
          } else if (typeof value === 'string') {
            result[key] =
              value.length > maxLength
                ? value.substring(0, maxLength) + ' [...]'
                : value;
          } else if (Array.isArray(value)) {
            result[key] = truncateLongStrings(value, excludedFields); // Gọi đệ quy với excludedFields
          } else if (typeof value === 'object') {
            result[key] = truncateLongStrings([value], excludedFields)[0]; // Gọi đệ quy với excludedFields
          } else {
            result[key] = value;
          }
        }
      }
      return result;
    }
    return item;
  });
}
