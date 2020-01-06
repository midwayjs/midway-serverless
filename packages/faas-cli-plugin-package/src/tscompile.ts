import { join } from 'path';
import { remove, copySync, existsSync } from 'fs-extra';
import * as globby from 'globby';
import { forkNode } from './utils';

export class TsBuild {
  async run(context) {
    const { cwd, argv } = context;

    const tscCli = require.resolve('typescript/bin/tsc');
    if (!existsSync(join(cwd, argv.project))) {
      console.log(`[ts compile] tsconfig.json not found in ${cwd}\n`);
      return;
    }
    const tsConfig = require(join(cwd, argv.project));
    const outDir = this.inferCompilerOptions(tsConfig, 'outDir');

    if (argv.clean) {
      await this.cleanDir(outDir);
    }

    await this.copyFiles(cwd, outDir, argv);

    if (argv.mode !== 'release') {
      argv.mode = 'debug';
    }

    const args = [];

    if (argv.project) {
      args.push('-p');
      args.push(argv.project);
    }
    await forkNode(tscCli, args, { cwd, execArgv: [] });
  }

  async cleanDir(dir) {
    if (dir) {
      await remove(dir);
    }
  }

  async copyFiles(cwd, outDir, argv) {
    if (outDir && existsSync(join(cwd, 'package.json'))) {
      const pkg = require(join(cwd, 'package.json'));
      if (pkg['midway-bin-build'] && pkg['midway-bin-build'].include) {
        for (const file of pkg['midway-bin-build'].include) {
          if (typeof file === 'string' && !/\*/.test(file)) {
            const srcDir = join(argv.srcDir, file);
            const targetDir = join(outDir, file);
            // 目录，或者不含通配符的普通文件
            this.copyFile(srcDir, targetDir, cwd);
          } else {
            // 通配符的情况
            const paths = await globby([].concat(file), {
              cwd: join(cwd, argv.srcDir),
            });
            for (const p of paths) {
              this.copyFile(
                join(argv.srcDir, p),
                join(outDir, p),
                cwd
              );
            }
          }
        }
      }
    }
  }

  copyFile(srcFile, targetFile, cwd) {
    if (!existsSync(srcFile)) {
      console.warn(`[ts compile] can't find ${srcFile} and skip it`);
    } else {
      copySync(join(cwd, srcFile), join(cwd, targetFile));
      console.log(`[ts compile] copy ${srcFile} to ${targetFile} success!`);
    }
  }

  inferCompilerOptions(tsConfig, option) {
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions[option])
      ) {
        return this.inferCompilerOptions(require(join(process.cwd(), tsConfig.extends)), option);
      }
    }

    if (tsConfig && tsConfig.compilerOptions) {
      return tsConfig.compilerOptions[option];
    }
  }
}
