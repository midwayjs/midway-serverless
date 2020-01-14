'use strict';

const { asyncWrapper } = require('@midwayjs/runtime-engine');
const { start } = require('@midwayjs/serverless-fc-starter');
const eggLayer = require('@midwayjs/egg-layer');

let runtime;
let inited;

const initializeMethod = async (config = {}) => {
  runtime = await start({
    layers: [eggLayer],
  });
  starter = new FaaSStarter({ config, baseDir: __dirname });
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async ({ config } = {}) => {
  await initializeMethod(config);
});

exports.handler = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  return runtime.asyncEvent()(...args);
});
