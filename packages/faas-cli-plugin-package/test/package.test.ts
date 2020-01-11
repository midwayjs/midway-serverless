import { CommandHookCore, loadSpec } from '@midwayjs/fcli-command-core';
import { PackagePlugin } from '../src/index';
import { join, resolve } from 'path';
import { existsSync, remove } from 'fs-extra';
import * as assert from 'assert';

describe('/test/package.test.ts', () => {
  describe('package base midway faas project', () => {
    const baseDir = resolve(__dirname, './fixtures/base-app');

    beforeEach(async () => {
      await remove(join(baseDir, 'serverless.zip'));
      await remove(join(baseDir, 'package-lock.json'));
      await remove(join(baseDir, '.serverless'));
    });
    it('base package', async () => {
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {},
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      assert(
        existsSync(resolve(baseDir, '.serverless/dist/index.js')) &&
          existsSync(resolve(baseDir, 'serverless.zip'))
      );
    });
    it('build target package', async () => {
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {
          buildDir: 'userbuild',
        },
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      assert(
        existsSync(resolve(baseDir, 'userbuild/.serverless/dist/index.js')) &&
          existsSync(resolve(baseDir, 'serverless.zip'))
      );
    });
  });

  describe('integration project build', () => {
    it('integration project build', async () => {
      const baseDir = resolve(__dirname, './fixtures/ice-faas-ts');
      const core = new CommandHookCore({
        config: {
          servicePath: baseDir,
        },
        commands: ['package'],
        service: loadSpec(baseDir),
        provider: 'aliyun',
        options: {
          sourceDir: 'src/apis',
        },
        log: console,
      });
      core.addPlugin(PackagePlugin);
      await core.ready();
      await core.invoke(['package']);
      assert(
        existsSync(resolve(baseDir, '.serverless/dist/index.js')) &&
          existsSync(resolve(baseDir, 'serverless.zip'))
      );
    });
  });
});
