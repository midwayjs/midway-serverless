import {
  BaseCLI,
  PluginManager,
  TestPlugin,
} from '@midwayjs/faas-plugin-common';
import { Invoke } from './invoke.plugin';

export class CLI extends BaseCLI {
  loadDefaultCommand() {
    this.core.addPlugin(PluginManager);
    this.core.addPlugin(Invoke);
    this.core.addPlugin(TestPlugin);
  }
}
