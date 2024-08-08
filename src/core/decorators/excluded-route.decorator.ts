import { SetMetadata } from '@nestjs/common';

export const EXCLUDED_ROUTE_KEY = Symbol('excluded-routes');

export const Excluded = (): ClassDecorator =>
  SetMetadata(EXCLUDED_ROUTE_KEY, true);
