import { BaseCLI } from '@midwayjs/fcli-command-core';
import { TestPlugin } from '@midwayjs/fcli-plugin-test';
import { Invoke } from './invoke.plugin';

export class CLI extends BaseCLI {
  loadDefaultPlugin() {
    this.core.addPlugin(Invoke);
    this.core.addPlugin(TestPlugin);
  }
}
