import { InvokeCore } from './core';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FCStarter from '@midwayjs/serverless-fc-starter';
import * as FCTrigger from '@midwayjs/serverless-fc-trigger';
import * as SCFStarter from '@midwayjs/serverless-scf-starter';
export class Invoke extends InvokeCore {
  async getInvokeFunction() {
    let invoke = await this.getUserFaasHandlerFunction();
    let runtime;
    let triggerMap;
    const provider = this.spec && this.spec.provider && this.spec.provider.name;
    if (provider) {
      let handler: any = ''; // todo
      if (provider === 'fc') {
        handler = FCStarter.asyncWrapper(async (...args) => {
          const innerRuntime = await FCStarter.start({});
          return innerRuntime.asyncEvent(invoke)(...args);
        });
        triggerMap = FCTrigger;
      } else if (provider === 'scf') {
        handler = SCFStarter.asyncWrapper(async (...args) => {
          const innerRuntime = await SCFStarter.start({});
          return innerRuntime.asyncEvent(invoke)(...args);
        });
      }
      if (handler) {
        runtime = createRuntime({
          handler
        });
      }
    }
    if (runtime) {
      invoke = async (...args) => {
        const trigger = this.getTrigger(triggerMap, args);
        await runtime.start();
        const result = await runtime.invoke(...trigger);
        await runtime.close();
        return result;
      };
    }
    return invoke;
  }

  getTrigger(triggerMap, args) {
    if (!triggerMap) {
      return args;
    }
    let triggerName = this.options.trigger;
    if (!triggerName) {
      const funcInfo = this.getFunctionInfo();
      if (funcInfo.events && funcInfo.events.length) {
        triggerName = Object.keys(funcInfo.events[0])[0];
      }
    }
    const EventClass = triggerMap[triggerName];
    if (EventClass) {
      return [new EventClass(...args)];
    }
    return args;
  }
}
