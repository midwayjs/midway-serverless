import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { generateFunctionsSpec, generateFunctionsSpecFile } from '../src/scf';
import { SCFServerlessStructure } from '../src/scf/interface';

describe('/test/scf.test.ts', () => {
  const root = path.resolve(__dirname, 'fixtures/scf/serverless');

  it('test transform yml', () => {
    const result: SCFServerlessStructure = generateFunctionsSpec(
      path.join(root, 'serverless.yml')
    );
    assert(result.functions);
    assert(Array.isArray(result.plugins));
  });

  it('test generate spce file', () => {
    generateFunctionsSpecFile(path.join(root, 'serverless.yml'));
    assert(fs.existsSync(path.join(root, '.serverless/serverless.yml')));
    fs.unlinkSync(path.join(root, '.serverless/serverless.yml'));
    fs.rmdirSync(path.join(root, '.serverless'));
  });
});
