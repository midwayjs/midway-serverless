import { InvokeCore } from '../src/core';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/core.test.ts', () => {
  it.only('single process invoke', async () => {
    console.log('before: ', process.env.MIDWAY_TS_MODE);

    const invokeCore = new InvokeCore({
      functionName: 'http',
      handler: 'http.handler',
      baseDir: join(__dirname, 'fixtures/baseApp'),
    });

    const data = await invokeCore.invoke({});
    assert(data && /hello/.test(data));
    console.log('after: ', process.env.MIDWAY_TS_MODE);
  });
});
