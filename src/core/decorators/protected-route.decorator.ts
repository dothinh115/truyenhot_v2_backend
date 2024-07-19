import { SetMetadata } from '@nestjs/common';

export const PROTECTED_ROUTE_KEY = 'protected';

export const Protected = (): MethodDecorator =>
  SetMetadata(PROTECTED_ROUTE_KEY, true);
