import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';

export const Fields = createParamDecorator(
  (data: ClassConstructor<any>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const result: any = plainToClass(data, request.body, {
      excludeExtraneousValues: true,
    });

    return result;
  },
);
