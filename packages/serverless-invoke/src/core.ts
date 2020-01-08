/*
  单进程模式的invoke
  invoke -> （trigger）-> invokeCore -> entrence -> userCode[ts build]
  1. 用户调用invoke
  2. tsc编译用户代码到dist目录
  3. 开源版: 【创建runtime、创建trigger】封装为平台invoke包，提供getInvoke方法，会传入args与入口方法，返回invoke方法
*/
import { faasDebug } from './debug';
import { FaaSStarterClass } from './utils';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { loadSpec } from '@midwayjs/fcli-command-core';
interface InvokeOptions {
  baseDir?: string;         // 目录，默认为process.cwd
  functionName: string;     // 函数名
  args?: any[];             // 调用参数
  getInvoke?: any;          // 获取调用方法
  debugPort?: string;       // debug端口
  handler?: string;         // 函数的handler方法
  trigger?: string;         // 触发器
}

export class InvokeCore {
  options: InvokeOptions;
  baseDir: string;
  starter: any;
  spec: any;

  constructor(options: InvokeOptions) {
    this.options = options;
    this.baseDir = options.baseDir || process.cwd();
    this.spec = loadSpec(this.baseDir);
  }

  async getStarter() {
    if (this.starter) {
      return this.starter;
    }
    const { functionName } = this.options;
    const { baseDir } = this;
    const starter = new FaaSStarterClass({
      baseDir,
      functionName
    });
    await starter.start();
    this.starter = starter;
    return this.starter;
  }

  // 获取用户代码中的函数方法
  async getUserFaasHandlerFunction() {
    const { debugPort } = this.options;
    const handler = this.options.handler || this.getFunctionInfo().handler || '';
    await this.buildTS();
    const starter = await this.getStarter();
    const wrapFun = starter.handleInvokeWrapper(handler, !!debugPort);
    return async (...args) => {
      if (debugPort) {
        const handler = await wrapFun(...args);
        return faasDebug(handler);
      }
      return wrapFun(...args);
    };
  }

  getFunctionInfo(functionName?: string) {
    functionName = functionName || this.options.functionName;
    return this.spec && this.spec.functions && this.spec.functions[functionName] || {};
  }

  async getInvokeFunction() {
    const invoke = await this.getUserFaasHandlerFunction();
    return invoke;
  }

  async buildTS() {
    const { baseDir } = this.options;
    const tsconfig = resolve(baseDir, 'tsconfig.json');
    // 非ts
    if (!existsSync(tsconfig)) {
      return;
    }
    let tsc = 'tsc';
    try {
      tsc = resolve(require.resolve('typescript'), '../../bin/tsc');
    } catch (e) {
      return this.invokeError('need typescript');
    }
    try {
      await execSync(`cd ${baseDir};${tsc} --skipLibCheck --skipDefaultLibCheck`);
    } catch (e) {
      this.invokeError(e);
    }
  }

  async invoke(...args: any) {
    const invoke = await this.getInvokeFunction();
    return invoke(...args);
  }

  async invokeError(err) {
    console.error('[faas invoke error]');
    console.error(err);
    process.exit(1);
  }
}
