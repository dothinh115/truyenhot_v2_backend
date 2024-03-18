import { Module, Type } from '@nestjs/common';
global.handlerOptions = [];
global.validateOptions = [];
type IOptions = {
  route: string;
  provider?: Type<any>;
  validate?: Type<any>;
};

@Module({})
export class HandlerModule {
  static register<T>(options: IOptions[]) {
    for (const option of options) {
      if (option.provider)
        global.handlerOptions.push({
          route: option.route,
          provider: new option.provider(),
        });
      if (option.validate) {
        global.validateOptions.push({
          route: option.route,
          provider: option.validate,
        });
      }

      const provider = {
        provide: option?.route,
        useClass: option?.provider,
      };
      return {
        module: HandlerModule,
        providers: [provider],
        exports: [provider],
      };
    }
  }
}
