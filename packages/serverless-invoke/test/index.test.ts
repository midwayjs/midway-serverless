import { invoke } from '../src';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/index.test.ts', () => {
  afterEach(() => {
    process.env.MIDWAY_TS_MODE = undefined;
  });
  it('should use origin http trigger', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      data: [{ name: 'params' }],
    });
    assert(result && result.body === 'hello http world');
  });

  it('should use origin http trigger in ice + faas demo by package options', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts-pkg-options'),
      functionName: 'test1',
      data: [{ name: 'params' }],
    });
    assert(result && result.body === 'hello http world');
  });

  it('should use origin http trigger in ice + faas demo by args', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts-standard'),
      functionName: 'test1',
      data: [{ name: 'params' }],
      sourceDir: 'src/apis',
    });
    assert(result && result.body === 'hello http world');
  });
});
