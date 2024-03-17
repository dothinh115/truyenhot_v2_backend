import { Module, Type } from '@nestjs/common';
export let handlerOptions = [];
type IOptions<T> = {
  route: string;
  provider: Type<T>;
};

@Module({})
export class HandlerModule {
  static register<T>(options: IOptions<T>[]) {
    for (const option of options) {
      handlerOptions.push({
        route: option.route,
        provider: new option.provider(),
      });
      const provider = {
        provide: option.route,
        useClass: option.provider,
      };
      return {
        module: HandlerModule,
        providers: [provider],
        exports: [provider],
      };
    }
  }
}
