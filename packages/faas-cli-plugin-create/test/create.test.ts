import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { CreatePlugin } from '../src/index';
import { join } from 'path';
import { remove, existsSync } from 'fs-extra';

describe('/test/create.test.ts', () => {
  const baseDir = join(__dirname, './tmp');
  beforeEach(async () => {
    if (existsSync(baseDir)) {
      await remove(baseDir);
    }
  });
  it('base create faas boilerplate', async () => {
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
      },
      commands: ['create'],
      service: loadSpec(baseDir),
      provider: 'aliyun',
      options: {},
      log: console,
    });
    core.addPlugin(CreatePlugin);
    await core.ready();
    await core.invoke(['create']);
    await remove(baseDir);
  });
});
