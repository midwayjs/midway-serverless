import { invoke as InvokeFun } from './main';
import { InvokeOptions } from './interface';

export const defualtRuntimeEventMap = {
  fc: {
    starter: require.resolve('@midwayjs/serverless-fc-starter'),
    eventPath: require.resolve('@midwayjs/serverless-fc-trigger'),
    eventName: {
      http: 'HTTPTrigger',
      apiGateway: 'ApiGatewayTrigger',
    },
  },
  scf: {
    starter: require.resolve('@midwayjs/serverless-scf-starter'),
  },
};

export const invoke = (options: InvokeOptions) => {
  const { runtime, trigger } = options;
  const runtimeEventMap = options.runtimeEventMap || defualtRuntimeEventMap;
  const runtimeMap = runtimeEventMap[runtime] || {};

  const starter = runtimeMap.starter;
  const eventPath = runtimeMap.eventPath;
  const eventName = runtimeMap.eventName && runtimeMap.eventName[trigger];

  return InvokeFun({
    ...options,
    starter,
    eventPath,
    eventName,
  });
};
