import {
  FunctionsStructure,
  HTTPEvent,
  ProviderStructure,
  TimerEvent,
  OSEvent,
  MQEvent,
  SpecBuilder,
  FunctionStructure,
} from '../index';
import {
  SCFServerlessStructure,
  SCFFunctionStructure,
  SCFAPIGatewayEvent,
  SCFHTTPMethod,
  SCFTimerEvent,
  SCFCOSEvent,
  SCFCMQEvent,
} from './interface';
import { safeAttachPropertyValue } from '../utils';

export class SCFServerlessSpecBuilder extends SpecBuilder {
  toJSON() {
    const providerData: ProviderStructure = this.getProvider();
    const serviceData = this.getService();
    const functionsData: FunctionsStructure = this.getFunctions();
    const serviceName = serviceData.name;

    const serverless: Partial<SCFServerlessStructure> = {
      service: serviceName,
      provider: {
        name: 'tencent',
        runtime: providerData.runtime || 'Nodejs10.15',
        region: providerData.region,
        credentials: (providerData as any).credentials,
        stage: providerData.stage,
        role: providerData.role,
        memorySize: providerData.memorySize || 128,
        environment: {
          variables: providerData.environment,
        },
        timeout: providerData.timeout || 3,
      },
      plugins: ['serverless-tencent-scf'],
      functions: {},
    };

    for (const funName in functionsData) {
      const funSpec = functionsData[funName] as FunctionStructure;

      const functionTemplate: SCFFunctionStructure = {
        handler: funSpec.handler || 'index.main_handler',
        description: funSpec.description || '',
        runtime: funSpec.runtime || serverless.provider.runtime,
        timeout: funSpec.timeout || serverless.provider.timeout,
        memorySize: funSpec.memorySize || serverless.provider.memorySize,
        environment: {
          variables: funSpec.environment || {},
        },
        events: [],
      };

      for (const event of funSpec['events']) {
        if (event['http'] || event['apigw']) {
          const evt = (event['http'] || event['apigw']) as HTTPEvent;
          const apiGateway: SCFAPIGatewayEvent = {
            name: `${funName}_${providerData.stage || ''}_apigw`,
            parameters: {
              httpMethod: convertMethods(evt.method),
              path: evt.path,
            },
          };

          safeAttachPropertyValue(
            apiGateway.parameters,
            'serviceTimeout',
            funSpec.timeout || evt.timeout
          );

          safeAttachPropertyValue(
            apiGateway.parameters,
            'stageName',
            funSpec.stage || providerData.stage
          );

          safeAttachPropertyValue(
            apiGateway.parameters,
            'serviceId',
            evt.serviceId || providerData.serviceId
          );

          safeAttachPropertyValue(
            apiGateway.parameters,
            'integratedResponse',
            evt.integratedResponse
          );

          safeAttachPropertyValue(
            apiGateway.parameters,
            'enableCORS',
            evt.cors
          );

          functionTemplate.events.push({
            apigw: apiGateway,
          });
        }

        if (event['timer']) {
          const evt = event['timer'] as TimerEvent;
          const timer: SCFTimerEvent = {
            name: 'timer',
            parameters: {
              cronExpression: evt.value,
              enable: evt.enable === false ? false : true,
            },
          };

          functionTemplate.events.push({
            timer,
          });
        }

        if (event['os'] || event['cos']) {
          const evt = (event['os'] || event['cos']) as OSEvent;
          const cos: SCFCOSEvent = {
            name: evt.name || 'cos',
            parameters: {
              bucket: evt.bucket,
              filter: evt.filter,
              events: evt.events,
              enable: evt.enable === false ? false : true,
            },
          };
          functionTemplate.events.push({ cos });
        }

        if (event['cmq'] || event['mq']) {
          const evt = (event['cmq'] || event['mq']) as MQEvent;
          const cmq: SCFCMQEvent = {
            name: 'cmq',
            parameters: {
              name: evt.topic,
              enable: evt.enable === false ? false : true,
            },
          };
          functionTemplate.events.push({ cmq });
        }

        // if (event['kafka']) {
        //   const ckafka = event['kafka'] as Ckafka;
        //   functionTemplate.events.push({ ckafka });
        // }
      }

      serverless.functions[funName] = functionTemplate;
    }

    return serverless;
  }
}

function convertMethods(method: string | string[]): SCFHTTPMethod {
  if (Array.isArray(method)) {
    method = method[0];
  }

  return method.toUpperCase() as SCFHTTPMethod;
}
