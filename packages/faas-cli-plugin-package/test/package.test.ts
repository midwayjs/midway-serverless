import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { resolve } from 'path';

const baseDir = resolve(__dirname, './fixtures/base-app');

describe('package', () => {
  it('base package', async () => {
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['package'],
      service: loadSpec(baseDir),
      provider: 'aliyun',
      options: {},
      log: console
    });
    core.addPlugin(PackagePlugin);
    await core.ready();
    await core.invoke(['package']);
  });
});
