import { generateFunctionsSpec } from '../src/fc';
import * as path from 'path';
import * as assert from 'assert';

describe('/test/fc.test.ts', () => {
  it('test base', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-base.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert(funResult['Properties']['InstanceConcurrency'] === 2);
    assert.deepStrictEqual(funResult['Events'], {});
  });

  it('test transform service properties', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-service-properties.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {});
    const properties =
      result['Resources']['serverless-hello-world']['Properties'];
    assert(properties['VpcConfig']);
    assert(properties['Policies']);
    assert(properties['LogConfig']);
    assert(properties['NasConfig']);
  });

  it('test http events', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-event-http.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {
      'http-index': {
        Properties: {
          AuthType: 'ANONYMOUS',
          Methods: ['GET'],
        },
        Type: 'HTTP',
      },
    });

    // second function
    const funResult2 = result['Resources']['serverless-hello-world']['index2'];
    assert(funResult2['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult2['Properties']['Initializer'] === 'index.initializer');
    assert(funResult2['Properties']['Handler'] === 'index.handler');
    assert(funResult2['Properties']['Runtime'] === 'nodejs10');

    assert.deepStrictEqual(funResult2['Events'], {
      'http-index2': {
        Properties: {
          AuthType: 'ANONYMOUS',
          Methods: ['POST'],
          InvocationRole: 'acs:ram::1234567890:role/fc-invoke-test',
          Qualifier: 'LATEST',
        },
        Type: 'HTTP',
      },
    });
  });

  it('test http events no method', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-event-http-no-method.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {
      'http-index': {
        Properties: {
          AuthType: 'ANONYMOUS',
          Methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        },
        Type: 'HTTP',
      },
    });
  });

  it('test api gateway event', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-event-apigw.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Initializer'] === 'index.initializer');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert.deepStrictEqual(funResult['Events'], {});
  });

  it('test transform environment', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-environment.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');
    assert(funResult['Properties']['EnvironmentVariables']['GLOBAL_PASS']);
    assert(!funResult['Properties']['EnvironmentVariables']['MYSQL_USER']);
    assert(!funResult['Properties']['EnvironmentVariables']['MYSQL_PASS']);

    const funResult2 = result['Resources']['serverless-hello-world']['index2'];
    assert(funResult2['Properties']['EnvironmentVariables']['GLOBAL_PASS']);
    assert(funResult2['Properties']['EnvironmentVariables']['MYSQL_USER']);
    assert(funResult2['Properties']['EnvironmentVariables']['MYSQL_PASS']);
  });

  it('test transform oss event', () => {
    const result = generateFunctionsSpec(
      path.join(__dirname, './fixtures/fc/f-event-oss.yml')
    );
    const funResult = result['Resources']['serverless-hello-world']['index'];
    assert(funResult['Type'] === 'Aliyun::Serverless::Function');
    assert(funResult['Properties']['Handler'] === 'index.handler');
    assert(funResult['Properties']['Runtime'] === 'nodejs10');

    assert.deepStrictEqual(funResult['Events'], {
      oss: {
        Type: 'OSS',
        Properties: {
          BucketName: 'ossBucketName',
          Enable: true,
          Events: ['oss:ObjectCreated:*', 'oss:ObjectRemoved:DeleteObject'],
          Filter: {
            Key: {
              Prefix: 'filterdir/',
              Suffix: '.jpg',
            },
          },
          InvocationRole: 'acs:ram::1234567890:role/fc-invoke-test',
          Qualifier: 'LATEST',
        },
      },
    });
  });
});
