import { invoke } from '../src';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/index.test.ts', () => {
  it('should use origin http trigger', async () => {
    // TODO 这个有问题，要重构，暂时不改了
    const result: any = await invoke({
      runtime: 'aliyun',
      trigger: 'http',
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      data: [{ name: 'params' }],
    });
    assert(result === 'hello http world');
  });
});
