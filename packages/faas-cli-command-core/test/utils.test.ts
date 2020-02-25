import { loadSpec } from '../src/utils/loadSpec';
import { compareFileChange } from '../src/utils/compare';
import * as assert from 'assert';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
describe('/test/utils.test.ts', () => {
  it('loadSpec', async () => {
    const spec = loadSpec(__dirname);
    assert(spec && spec.provider && spec.provider.name === 'ginkgo');
  });
  it('compareFileChange', async () => {
    writeFileSync(resolve(__dirname, './tmp/1.from'), '');
    writeFileSync(resolve(__dirname, './tmp/1.to'), '');
    writeFileSync(resolve(__dirname, './tmp/2.from'), '');
    const result = await compareFileChange(['./tmp/*.from'], ['./tmp/*.to'], { cwd: __dirname });
    assert(result && result[0] === './tmp/2.from');
  });
});
