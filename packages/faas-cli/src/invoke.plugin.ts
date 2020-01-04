import { InvokePlugin as BaseInvokePlugin } from '@midwayjs/faas-plugin-common';
import { runtimeEventMap } from '@midwayjs/invoke';

export class Invoke extends BaseInvokePlugin {
  getEventOptions(runtime: string, trigger: string) {
    const runtimeMap = runtimeEventMap[runtime] || {};
    return {
      starter: runtimeMap.starter,
      eventPath: runtimeMap.eventPath,
      eventName: runtimeMap.eventName && runtimeMap.eventName[trigger],
    };
  }
}
