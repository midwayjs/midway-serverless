import { join, relative, resolve } from 'path';
import { remove, writeJSON, readFileSync, removeSync } from 'fs-extra';
import { BuildCommand } from 'midway-bin';

export const tsIntegrationProjectCompile = async (baseDir, options: {
  sourceDir: string;
  buildRoot: string;
  tsCodeRoot: string;
  incremental: boolean;
  temTsConfig?: any; // 临时的ts配置
  clean: boolean;
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
    temTsConfig: options.temTsConfig,
    clean: options.clean,
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
  let tsConfigJson = options.tsConfigName || 'tsconfig.json';
  let temTsConfigFile;
  if (options.temTsConfig) {
    try {
      temTsConfigFile = '.tmp_tsconfig.log.json';
      const tsJson = JSON.parse(readFileSync(resolve(baseDir, tsConfigJson)).toString());
      Object.assign(tsJson.compilerOptions, options.temTsConfig);
      tsConfigJson = temTsConfigFile;
      temTsConfigFile = resolve(baseDir, temTsConfigFile);
      await writeJSON(temTsConfigFile, tsJson);
    } catch (e) {}
  }

  await builder.run({
    cwd: baseDir,
    argv: {
      clean: typeof options.clean === 'undefined' ? true : options.clean,
      project: tsConfigJson,
      srcDir: options.source || 'src',
    },
  });

  if (temTsConfigFile) {
    try {
      removeSync(temTsConfigFile);
    } catch (e) {}
  }
};
