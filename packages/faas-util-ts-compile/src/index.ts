import { join, relative, resolve } from 'path';
import { remove, writeJSON, readFileSync, removeSync } from 'fs-extra';
import { BuildCommand } from 'midway-bin';
import { tmpdir } from 'os';

export const tsIntegrationProjectCompile = async (baseDir, options: {
  sourceDir: string;
  buildRoot: string;
  tsCodeRoot: string;
  incremental: boolean;
  clean: boolean;
  temTsConfig: any; // 临时的ts配置
}) => {
  const tsFaaSConfigFilename = 'tsconfig_integration_faas.json';
  // 生成一个临时 tsconfig
  const tempConfigFilePath = join(baseDir, tsFaaSConfigFilename);
  await remove(tempConfigFilePath);
  // 重新写一个新的
  await writeJSON(tempConfigFilePath, {
    compileOnSave: true,
    compilerOptions: {
      incremental: !!options.incremental,
      target: 'ES2018',
      module: 'commonjs',
      moduleResolution: 'node',
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      inlineSourceMap: true,
      noImplicitThis: true,
      noUnusedLocals: true,
      stripInternal: true,
      pretty: true,
      declaration: true,
      jsx: 'react',
      outDir: relative(
        baseDir,
        join(options.buildRoot, 'dist')
      ),
    },
    include: [
      `${relative(
        baseDir,
        options.tsCodeRoot
      )}/**/*`,
    ],
    exclude: ['dist', 'node_modules', 'test'],
  });
  await tsCompile(baseDir, {
    tsConfigName: tsFaaSConfigFilename,
    source: options.sourceDir,
    clean: options.clean,
    temTsConfig: options.temTsConfig,
  });
};

/**
 * 通用 tsc 构建
 * @param baseDir 项目根目录
 * @param options
 * @param options.source ts 文件所在的目录，比如 src
 * @param options.tsConfigName tsconfig.json 名
 * @param options.clean 是否在构建前清理
 */
export const tsCompile = async (baseDir: string, options: {
  source?: string;
  tsConfigName?: string;
  clean?: boolean;
  temTsConfig?: any; // extra tsconfig
} = {}) => {
  const builder = new BuildCommand();
  const tsConfigJson = options.tsConfigName || 'tsconfig.json';
  let temTsConfigFile;

  if (options.temTsConfig) {
    try {
      temTsConfigFile = resolve(tmpdir(), `${Date.now()}_${Math.random()}.json`);
      const tsJson = JSON.parse(readFileSync(resolve(baseDir, tsConfigJson)).toString());
      Object.assign(tsJson.compilerOptions, options.temTsConfig);
      await writeJSON(temTsConfigFile, tsJson);
    } catch (e) {}
  }

  await builder.run({
    cwd: baseDir,
    argv: {
      clean: typeof options.clean === 'undefined' ? true : options.clean,
      project: temTsConfigFile || tsConfigJson,
      srcDir: options.source || 'src',
    },
  });

  if (temTsConfigFile) {
    try {
      removeSync(temTsConfigFile);
    } catch (e) {}
  }
};
