// custom-logger.ts
import { ConsoleLogger } from '@nestjs/common';

export class FinManLogger extends ConsoleLogger {
  private silencedContexts = ['InstanceLoader', 'RoutesResolver', 'RouterExplorer'];

  log(message: any, context?: string) {
    if (context && this.silencedContexts.includes(context)) {
      return;
    }
    super.log(message, context);
  }
}