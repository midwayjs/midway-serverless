import { CLI } from '@midwayjs/faas-plugin-common';
import { Invoke } from './invoke.plugin';

export { Test } from '@midwayjs/faas-plugin-common';
export { Invoke } from './invoke.plugin';

export class AliCLI extends CLI {
  commands: any;
  loadPlatformPlugin() {}

  loadCommandInvoke() {
    this.core.addPlugin(Invoke);
  }
}
