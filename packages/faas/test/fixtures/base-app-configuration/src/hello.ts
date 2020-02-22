import { inject, provide, func, FunctionHandler } from '../../../../src';
import { UserManager } from './lib/userManager';
import assert = require('assert');

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {

  @inject()
  ctx;  // context

  @inject()
  userManager: UserManager;

  @inject('@midway-plugin-mod:articleManager')
  articleManager: any;

  async handler(event) {
    assert.equal(await this.userManager.getUser(), 'harry', 'userManager.getUser should be ok');

    return event.text + (await this.articleManager.getOne());
  }
}
