const cp = require('child_process');

interface Ilayer {
  [extName: string]: {
    path: string;
  };
}

export function formatLayers(...multiLayers: Ilayer[]) {
  const layerTypeList = { npm: {} };
  multiLayers.forEach((layer: Ilayer) => {
    Object.keys(layer || {}).forEach(layerName => {
      const [type, path] = layer[layerName].path.split(':');
      if (!layerTypeList[type]) {
        return;
      }
      layerTypeList[type][layerName] = path;
    });
  });
  return layerTypeList;
}

const childs: any = new Set();
let hadHook = false;
function gracefull(proc) {

  childs.add(proc);

  if (!hadHook) {
    hadHook = true;
    let signal;
    [ 'SIGINT', 'SIGQUIT', 'SIGTERM' ].forEach((event: any) => {
      process.once(event, () => {
        signal = event;
        process.exit(0);
      });
    });

    process.once('exit', () => {
      // had test at my-helper.test.js, but coffee can't collect coverage info.
      for (const child of childs) {
        child.kill(signal);
      }
    });
  }
}

export function forkNode(modulePath, args = [], options: any = {}) {
  options.stdio = options.stdio || 'inherit';
  const proc = cp.fork(modulePath, args, options);
  gracefull(proc);

  return new Promise((resolve, reject) => {
    proc.once('exit', code => {
      childs.delete(proc);
      if (code !== 0) {
        const err: any = new Error(modulePath + ' ' + args + ' exit with code ' + code);
        err.code = code;
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
