import { BasePlugin } from '@midwayjs/fcli-command-core';
import { join, relative, resolve } from 'path';
import {
  copy,
  createWriteStream,
  ensureDir,
  existsSync,
  readFileSync,
  remove,
  statSync,
  unlinkSync,
  writeFileSync,
  writeJSON,
} from 'fs-extra';
import * as globby from 'globby';
import { formatLayers } from './utils';
import { BuildCommand } from 'midway-bin';
import { exec } from 'child_process';
import * as archiver from 'archiver';
import { AnalyzeResult, Locator } from '@midwayjs/locate';

export class PackagePlugin extends BasePlugin {
  core: any;
  options: any;
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');
  codeAnalyzeResult: AnalyzeResult;

  commands = {
    package: {
      usage: 'Packages a Serverless service',
      lifecycleEvents: [
        'cleanup', // 清理构建目录
        'devDepInstall', // 安装开发期依赖
        'tscompile', // 编译函数  'package:after:tscompile'
        'spec', // 生成对应平台的描述文件，例如 serverless.yml 等
        'wrapper', // 生成对应平台的入口文件
        'copyFile', // 拷贝文件: package.include
        'layerInstall', // 安装layer
        'depInstall', // 安装依赖
        'package', // 函数打包
        'finalize', // 完成
      ],
      // 暂无
      options: {
        npm: {
          usage: 'NPM client name',
        },
        buildDir: {
          usage: 'Build relative path, default is .serverless',
        },
        sourceDir: {
          usage: 'Source relative path, default is src',
        },
        skipZip: {
          usage: 'Skip zip package',
          shortcut: 'z',
        },
        stage: {
          usage: 'Stage of the service',
          shortcut: 's',
        },
        resolve: {
          usage: 'Resolve layer versions and lock them in final archive',
          shortcut: 'r',
        },
      },
    },
  };

  hooks = {
    'package:cleanup': this.cleanup.bind(this),
    'package:devDepInstall': this.devDepInstall.bind(this),
    'package:copyFile': this.copyFile.bind(this),
    'package:layerInstall': this.layerInstall.bind(this),
    'package:depInstall': this.depInstall.bind(this),
    'package:package': this.package.bind(this),
    'package:tscompile': this.tsCompile.bind(this),
  };

  async cleanup() {
    // 分析目录结构
    const locator = new Locator(this.servicePath);
    this.codeAnalyzeResult = await locator.run({
      tsBuildRoot:
        this.options.buildDir && join(this.servicePath, this.options.buildDir),
      tsCodeRoot:
        this.options.sourceDir &&
        join(this.servicePath, this.options.sourceDir),
    });
    // 构建目标目录
    this.midwayBuildPath = this.codeAnalyzeResult.tsBuildRoot;
    await remove(this.midwayBuildPath);
    await ensureDir(this.midwayBuildPath);
    this.core.cli.log(` - Information`);
    this.core.cli.log(`   ⊙ BaseDir: ${this.servicePath}`);
    if (this.codeAnalyzeResult.midwayRoot) {
      this.core.cli.log(
        `   ⊙ ProjectType: ${this.codeAnalyzeResult.projectType}`
      );
      this.core.cli.log(
        `   ⊙ MidwayRoot: ${
          this.servicePath === this.codeAnalyzeResult.midwayRoot
            ? '.'
            : relative(this.servicePath, this.codeAnalyzeResult.midwayRoot)
        }`
      );
      if (this.codeAnalyzeResult.integrationProject) {
        this.core.cli.log(
          `   ⊙ tsCodeRoot: ${relative(
            this.servicePath,
            this.codeAnalyzeResult.tsCodeRoot
          )}`
        );
        this.core.cli.log(
          `   ⊙ tsBuildRoot: ${relative(
            this.servicePath,
            this.codeAnalyzeResult.tsBuildRoot
          )}`
        );
      }
    }
  }

  async devDepInstall() {
    this.core.cli.log(' - Install development dependencies...');
    if (!existsSync(join(this.servicePath, 'node_modules'))) {
      await this.npmInstall({
        baseDir: this.servicePath
      });
      this.core.cli.log('  - Install development dependencies complete...');
    } else {
      this.core.cli.log('  - Find node_modules and skip...');
    }
  }

  async copyFile() {
    const packageObj: any = this.core.service.package || {};
    const include = await globby(
      [this.options.sourceDir || 'src', 'tsconfig.json', 'package.json'].concat(
        packageObj.include || []
      ),
      { cwd: this.servicePath }
    );
    const exclude = await globby(packageObj.exclude || [], {
      cwd: this.servicePath,
    });
    const paths = include.filter((filePath: string) => {
      return exclude.indexOf(filePath) === -1;
    });
    await Promise.all(
      paths.map((path: string) => {
        return copy(
          join(this.servicePath, path),
          join(this.midwayBuildPath, path)
        );
      })
    );
    if (this.codeAnalyzeResult.integrationProject) {
      await writeJSON(join(this.midwayBuildPath, 'package.json'), {
        name: this.codeAnalyzeResult.projectType,
        version: '1.0.0',
        dependencies: this.codeAnalyzeResult.usingDependenciesVersion.valid,
      });
    }
    this.core.cli.log(` - File copy complete`);
  }

  async layerInstall() {
    const funcLayers = [];
    if (this.core.service.functions) {
      for (const func in this.core.service.functions) {
        const funcConf = this.core.service.functions[ func ];
        if (funcConf.layers) {
          funcLayers.push(funcConf.layers);
        }
      }
    }
    const layerTypeList = formatLayers(this.core.service.layers, ...funcLayers);
    const npmList = Object.keys(layerTypeList.npm).map(
      (name: string) => layerTypeList.npm[ name ]
    );
    if (npmList && npmList.length) {
      await this.npmInstall({
        npmList
      });
    }
    this.core.cli.log(` - layers install complete`);
  }

  // 安装npm到构建文件夹
  async npmInstall(options: {
    npmList?: string[],
    baseDir?: string;
    production?: boolean;
  } = {}) {
    return new Promise((resolve, reject) => {
      const installDirectory = options.baseDir || this.midwayBuildPath;
      const pkgJson: string = join(installDirectory, 'package.json');
      if (!existsSync(pkgJson)) {
        writeFileSync(pkgJson, '{}');
      }
      exec(
        `${this.options.npm || 'npm'} install ${
          options.npmList ? `${options.npmList.join(' ')}` : (options.production ? '--production' : '')
        }`, { cwd: installDirectory },
        err => {
          if (err) {
            const errmsg = (err && err.message) || err;
            this.core.cli.log(` - npm install err ${errmsg}`);
            reject(errmsg);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async depInstall() {
    if (this.options.ncc) {
      this.core.cli.log(' - Dep install skip: using ncc');
      return;
    }
    // globalDependencies
    // pkg.json dependencies
    // pkg.json localDependencies
    const pkgJsonPath: string = join(this.midwayBuildPath, 'package.json');
    let pkgJson: any = {};
    try {
      pkgJson = JSON.parse(readFileSync(pkgJsonPath).toString());
    } catch (e) {
    }
    const allDependencies = Object.assign(
      {},
      this.core.service.globalDependencies,
      pkgJson.dependencies,
      pkgJson.localDependencies
    );
    pkgJson.dependencies = {};
    const localDep = {};
    for (const depName in allDependencies) {
      const depVersion = allDependencies[ depName ];
      if (/^(\.|\/)/.test(depVersion)) {
        // local dep
        const depPath = join(this.servicePath, depVersion);
        if (existsSync(depPath)) {
          localDep[ depName ] = depPath;
        } else {
          this.core.cli.log(` - local dep ${depName}:${depVersion} not exists`);
        }
      } else {
        pkgJson.dependencies[ depName ] = depVersion;
      }
    }
    writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '  '));
    await this.npmInstall({
      production: true
    });
    for (const localDepName in localDep) {
      const target = join(this.midwayBuildPath, 'node_modules', localDepName);
      await copy(localDep[ localDepName ], target);
    }
    this.core.cli.log(` - Dep install complete`);
  }

  async tsCompile() {
    const isTsDir = existsSync(join(this.servicePath, 'tsconfig.json'));
    this.core.cli.log(' - Building Midway FaaS directory files...');
    if (!isTsDir) {
      this.core.cli.log(' - Not found tsconfig.json and skip build');
      return;
    }
    if (this.options.ncc) {
      this.core.cli.log('   - Using single file build mode');
      // await buildByNcc();
    } else {
      this.core.cli.log('   - Using tradition build mode');
      const builder = new BuildCommand();
      const source = this.options.sourceDir || 'src';
      if (this.codeAnalyzeResult.integrationProject) {
        const tsFaaSConfigFilename = 'tsconfig_integration_faas.json';
        // 生成一个临时 tsconfig
        const tempConfigFilePath = join(this.servicePath, tsFaaSConfigFilename);
        await remove(tempConfigFilePath);
        // 重新写一个新的
        await writeJSON(tempConfigFilePath, {
          compileOnSave: true,
          compilerOptions: {
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
            outDir: 'dist',
          },
          // include: [
          //   `${relative(
          //     this.servicePath,
          //     this.codeAnalyzeResult.tsCodeRoot
          //   )}/**/*`
          // ],
          exclude: ['dist', 'node_modules', 'test'],
        });
        await builder.run({
          cwd: this.servicePath,
          argv: {
            clean: true,
            project: tsFaaSConfigFilename,
            // srcDir: source,
          },
        });
        await remove(tempConfigFilePath);
      } else {
        await builder.run({
          cwd: this.servicePath,
          argv: {
            clean: true,
            project: 'tsconfig.json',
            srcDir: source,
          },
        });
      }

      // await remove(join(this.midwayBuildPath, source));
    }
    this.core.cli.log(`   - Build Midway FaaS complete`);
  }

  async package() {
    // 跳过打包
    if (this.options.skipZip) {
      return;
    }
    // 构建打包
    const file = join(this.servicePath, 'serverless.zip');
    await this.makeZip(this.midwayBuildPath, file);
    const stat = statSync(file);
    this.core.cli.log(
      ` - Zip size ${Number(stat.size / (1024 * 1024)).toFixed(2)}MB`
    );
    if (this.options.package) {
      const to = resolve(this.servicePath, this.options.package);
      await copy(file, to);
      await unlinkSync(file);
    }
  }

  makeZip(sourceDirection: string, targetFileName: string) {
    return new Promise(resolve => {
      const output = createWriteStream(targetFileName);
      output.on('close', function () {
        resolve(archive.pointer());
      });
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });
      archive.pipe(output);
      archive.directory(sourceDirection, false);
      archive.finalize();
    });
  }
}
