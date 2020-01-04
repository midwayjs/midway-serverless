import { SCFTemplateSpecBuilder } from './builder/template';
import { SCFServerlessSpecBuilder } from './builder/serverless';
import { transform, generate } from '..';

export const generateFunctionsSpec = (filePath: any) => {
  return transform(filePath, SCFServerlessSpecBuilder);
};

export const generateTemplateFunctionsSpec = (filePath: any) => {
  return transform(filePath, SCFTemplateSpecBuilder);
};

export const generateFunctionsSpecFile = (
  sourceFilePathOrJson: any,
  targetFilePath = '.serverless/serverless.yml'
) => {
  generate(sourceFilePathOrJson, targetFilePath, SCFServerlessSpecBuilder);
};

export const generateTemplateFunctionsSpecFile = (
  sourceFilePathOrJson: any,
  targetFilePath = 'template.yml'
) => {
  generate(sourceFilePathOrJson, targetFilePath, SCFTemplateSpecBuilder);
};
