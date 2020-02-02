import { LoggerOptions } from 'egg-logger';

export type ContextExtensionHandler = (ctx, runtime: Runtime) => Promise<void>;
export type HealthExtensionHandler = (ctx, runtime: Runtime) => Promise<void>;
export type EventExtensionHandler = (
  runtime: Runtime
) => Promise<FunctionEvent>;
export type handlerWrapper = (...args) => any;

export const FAAS_ARGS_KEY = 'FAAS_ARGS';

export interface RuntimeEngine {
  add(engineHandler: (engine: RuntimeEngine) => void);
  addBaseRuntime(baseRuntime: Runtime);
  addRuntimeExtension(ext: RuntimeExtension): RuntimeEngine;
  addContextExtension(
    contextExtensionHandler: ContextExtensionHandler
  ): RuntimeEngine;
  addHealthExtension(
    healthExtensionHandler: HealthExtensionHandler
  ): RuntimeEngine;
  addEventExtension(
    eventExtensionHandler: EventExtensionHandler
  ): RuntimeEngine;
  ready();
  close();
  getCurrentRuntime(): Runtime;
}

export interface RuntimeExtension {
  beforeRuntimeStart?(runtime: Runtime);
  afterRuntimeStart?(runtime: Runtime);
  beforeFunctionStart?(runtime: Runtime);
  afterFunctionStart?(runtime: Runtime);
  beforeClose?(runtime: Runtime);
  createLogger?(filename?, options?);
  createEnvParser?(): PropertyParser<string>;
  beforeInvoke?(functionContext: any, args?: any, meta?: any);
  afterInvoke?(err: Error, result: any, context?: any);
  defaultInvokeHandler?(...args);
}

export interface Runtime extends RuntimeExtension {
  debugLogger: any;
  logger: any;
  eventHandlers: FunctionEvent[];
  init(contextExtensions: ContextExtensionHandler[]);
  runtimeStart(eventExtensions: EventExtensionHandler[]);
  functionStart();
  ready(healthExtensions: HealthExtensionHandler[]);
  close();
  getProperty(propertyKey: string);
  getPropertyParser(): PropertyParser<string>;
  invokeInitHandler(...args);
  invokeDataHandler(...args);
  getContextExtensions(): ContextExtensionHandler[];
}

export interface LightRuntime extends Runtime {
  invokeHandlerWrapper(context, invokeHandler);
  asyncEvent(handler: handlerWrapper): (...args) => void;
}

export interface IServerlessLogger {
  log?(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  write?(msg: string): void;
}

export interface PropertyParser<T> {
  setProperty(key: string, value);
  getProperty(key: string, defaultValue?);
  getInitTimeout(): T;
  getInitHandler(): T;
  getFuncTimeout(): T;
  getFunctionHandler(): T;
  getFunctionRuntime(): T;
  getEntryDir(): T;
  getTriggerType(): T;
  getFunctionLayer(): T;
  getLoggerLevel(): T;
}

export interface ServerlessLoggerOptions extends LoggerOptions {
  file?: string;
  eol?: string;
  formatter?: any;
}

export interface LoggerFactory {
  createLogger(options?);
}

export abstract class FunctionEvent {
  runtime: Runtime;
  type: string;
  meta: object;

  constructor(type: string, meta?) {
    this.type = type;
    this.meta = meta;
  }

  setRuntime(runtime: Runtime) {
    this.runtime = runtime;
  }

  validate(...args): boolean {
    return true;
  }

  transformInvokeArgs?(...args): any[];
}

export interface Bootstrap {
  start(runtime);
  close();
  getRuntime();
  getRuntimeEngine();
}

export interface BootstrapOptions {
  layers?: any[];
  runtime?: Runtime;
}
