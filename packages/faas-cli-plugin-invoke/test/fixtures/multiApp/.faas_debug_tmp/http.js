const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('/Users/soar/project/github/midway-faas/packages/serverless-fc-starter/dist/index.js');


let starter;
let runtime;
let inited = false;

const initializeMethod = async (config = {}) => {
  runtime = await start({
    layers: []
  });
  starter = new FaaSStarter({ config, baseDir: __dirname });
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async ({config} = {}) => {
  await initializeMethod(config);
});


exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  
  return runtime.asyncEvent(starter.handleInvokeWrapper('http.handler'))(...args);
  
});
