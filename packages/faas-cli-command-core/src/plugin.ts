import {
  IPluginInstance,
  IPluginHooks,
  IPluginCommands,
} from './interface/plugin';
import { ICoreInstance } from './interface/commandHookCore';

export class BasePlugin implements IPluginInstance {
  public core: ICoreInstance;
  public options: any;
  public commands: IPluginCommands;
  public hooks: IPluginHooks;
  private name: string = this.getName();

  constructor(core: ICoreInstance, options: any) {
    this.core = core;
    this.options = options;
    this.commands = {};
    this.hooks = {};
  }

  public getName() {
    return this.constructor.name;
  }

  public setStore(type: string, value: any) {
    this.core.store.set(`${this.name}:${type}`, value);
  }

  public getStore(type: string, name?: string) {
    if (name) {
      return this.core.store.get(`${name}:${type}`);
    } else {
      const filterKey = [...this.core.store.keys()].filter(key => {
        return key.endsWith(`:${type}`);
      });
      if (filterKey.length > 1) {
        console.log(
          `[Core] Get store by '${type}' matches ${
            filterKey.length
          } (${filterKey.join(', ')}), current use '${filterKey[0]}'`
        );
      }
      return this.core.store.get(filterKey[0]);
    }
  }
}
