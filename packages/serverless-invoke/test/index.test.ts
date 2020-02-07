import { invoke } from '../src';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/index.test.ts', () => {
  it('should use origin http trigger', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      data: [{ name: 'params' }],
    });
    assert(result && result.body === 'hello http world');
  });

  it.only('should use origin http trigger in ice + faas demo', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/ice-faas-ts'),
      functionName: 'test1',
      data: [{ name: 'params' }],
    });
    assert(result && result.body === 'hello http world');
  });
});
