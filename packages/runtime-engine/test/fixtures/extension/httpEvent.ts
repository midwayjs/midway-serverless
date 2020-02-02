import { FunctionEvent, Runtime } from '../../../src';

export class HttpEvent extends FunctionEvent {
  logger;
  handler;

  constructor(options) {
    super('HTTP', { domainName: 'http.test.com' });
    this.logger = options.logger;
  }

  validate() {
    return true;
  }

  transformInvokeArgs(...args): any[] {
    return args;
  }
}
