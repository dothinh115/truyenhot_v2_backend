import { SetMetadata } from '@nestjs/common';

export const PROTECTED_ROUTE_KEY = Symbol('protected');

export const Protected = (): MethodDecorator =>
  SetMetadata(PROTECTED_ROUTE_KEY, true);
