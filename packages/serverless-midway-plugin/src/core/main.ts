import { ProviderManager } from './providerManager';
import { IServerless, IServerlessOptions } from '../interface/midwayServerless';
import { transform, saveYaml } from '@midwayjs/serverless-spec-builder';
import { join } from 'path';
import { commonPrefix } from './utils';
const { Select } = require('enquirer');
const coverAttributes = ['layers', 'aggregation'];
export class MidwayServerless {
  serverless: IServerless;
  options: IServerlessOptions;

  constructor(serverless: IServerless, options: IServerlessOptions) {
    this.serverless = serverless;
    this.options = options;
  }

  async asyncInit() {
    const yamlFile = join(this.serverless.config.servicePath, 'serverless.yml');
    const serviceyml = transform(yamlFile);

    if (!this.serverless.service.provider) {
      this.serverless.service.provider = serviceyml.provider = {
        name: '',
        runtime: '',
      };
    }

    if (!this.serverless.service.provider.name || this.options.platform) {
      let platform = this.options.platform;
      let needSelectPlatform = false;
      if (!this.serverless.service.provider.name) {
        // 未标明哪个平台
        needSelectPlatform = true;
      } else if (this.options.platform === true) {
        // 使用 --platform
        needSelectPlatform = true;
      }
      if (needSelectPlatform) {
        const prompt = new Select({
          name: 'provider',
          message: 'Which platform do you want to use?',
          choices: ['阿里云函数计算 aliyun fc', '腾讯云函数 tencent scf'],
        });
        const answers = await prompt.run();
        platform = answers.split(' ')[1];
      }
      if (typeof platform === 'string') {
        serviceyml.provider.name = platform;
        this.serverless.service.provider.name = platform;
        this.serverless.pluginManager.serverlessConfigFile.provider.name = platform;
        saveYaml(yamlFile, serviceyml);
      }
    }

    coverAttributes.forEach((attr: string) => {
      if (serviceyml[attr]) {
        this.serverless.service[attr] = serviceyml[attr];
      }
    });

    this.assignAggregationToFunctions();

    ProviderManager.call(this);

    if (!this.serverless.pluginManager.commands.deploy) {
      this.serverless.pluginManager.commands.deploy = {};
    }
    this.serverless.pluginManager.commands.deploy.lifecycleEvents = [
      'midway-deploy',
    ];
  }

  // 合并高密度部署
  assignAggregationToFunctions() {
    if (
      !this.serverless.service.aggregation ||
      !this.serverless.service.functions
    ) {
      return;
    }

    if (
      !this.serverless.service.custom ||
      !this.serverless.service.custom.customDomain ||
      !this.serverless.service.custom.customDomain.domainName
    ) {
      console.warn(
        'If using aggregation deploy, please configure custom domain'
      );
      return;
    }

    this.serverless.cli.log('Aggregation Deploy');
    const allAggregationPaths = [];
    for (const aggregationName in this.serverless.service.aggregation) {
      const aggregationFuncName = `aggregation${aggregationName}`;
      this.serverless.service.functions[
        aggregationFuncName
      ] = this.serverless.service.aggregation[aggregationName];
      this.serverless.service.functions[
        aggregationFuncName
      ].handler = `${aggregationFuncName}.handler`;
      this.serverless.service.functions[
        aggregationFuncName
      ]._isAggregation = true;
      if (!this.serverless.service.functions[aggregationFuncName].events) {
        this.serverless.service.functions[aggregationFuncName].events = [];
      }
      // 忽略原始方法，不再单独进行部署
      const deployOrigin = this.serverless.service.aggregation[aggregationName]
        .deployOrigin;

      const allPaths = [];
      let handlers = [];
      if (this.serverless.service.aggregation[aggregationName].functions) {
        handlers = this.serverless.service.aggregation[
          aggregationName
        ].functions
          .map((functionName: string) => {
            const functions = this.serverless.service.functions;
            const func = functions[functionName];
            if (!func || !func.events) {
              return;
            }
            const httpEventIndex = func.events.findIndex(
              (event: any) => !!event.http
            );
            if (httpEventIndex === -1) {
              return;
            }
            const httpEvent = func.events[httpEventIndex];
            if (!httpEvent || !httpEvent.http.path) {
              return;
            }
            allPaths.push(httpEvent.http.path);
            if (!deployOrigin) {
              // 不把原有的函数进行部署
              this.serverless.service.functions[functionName]._ignore = true;
            }
            return {
              path: httpEvent.http.path,
              handler: func.handler,
            };
          })
          .filter((func: any) => !!func);
      }

      let currentPath = commonPrefix(allPaths);
      currentPath = currentPath ? `${currentPath}/*` : '/*';
      this.serverless.cli.log(
        ` - using '${currentPath}' to deploy '${allPaths.join(`', '`)}'`
      );
      if (allAggregationPaths.indexOf(currentPath) !== -1) {
        console.error(
          `Cannot use the same prefix '${currentPath}' for aggregation deployment`
        );
        process.exit();
      }
      allAggregationPaths.push(currentPath);
      this.serverless.service.functions[
        aggregationFuncName
      ]._handlers = handlers;
      this.serverless.service.functions[aggregationFuncName].events = [
        { http: { method: 'get', path: currentPath } },
      ];
    }
  }
}
