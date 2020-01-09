import { Invoke } from './invoke';
import { InvokeOptions } from './interface';

export const invoke = async (options: InvokeOptions) => {
  const invokeFun = new Invoke({
    baseDir: options.functionDir,
    functionName: options.functionName,
    handler: options.handler,
    trigger: options.trigger
  });
  if (!options.data || !options.data.length) {
    options.data = [{}];
  }
  return invokeFun.invoke([].concat(options.data));
};
