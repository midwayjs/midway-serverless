import * as globby from 'globby';
// 符合sourceGlob条件的文件中 是否存在 比所有符合toGlob条件的文件 要新的文件
// 返回 fromGlob 中更新的文件
export const compareFileChange = async (fromGlob: string[], toGlob: string[], options?: any) => {
  options = options || {};
  if (!options.cwd) {
    options.cwd = process.cwd();
  }
  options.stats = true;
  const fromFiles: any = await globby(fromGlob, options);
  const toFiles: any = await globby(toGlob, options);

  if (!fromFiles || !fromFiles.length) {
    return [];
  }

  if (!toFiles || !toFiles.length) {
    return fromFiles.map((file: any) => file.path);
  }
  let latestFilesChangeTime = 0;
  for (const file of toFiles) {
    if (file.stats.mtimeMs > latestFilesChangeTime) {
      latestFilesChangeTime = file.stats.mtimeMs;
    }
  }
  const result = [];
  for (const file of fromFiles) {
    if (file.stats.mtimeMs > latestFilesChangeTime) {
      result.push(file.path);
    }
  }
  return result;
};
