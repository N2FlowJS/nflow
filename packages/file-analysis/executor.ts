import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { FileAnalysisForm } from './types';
import * as fs from 'fs';
import * as path from 'path';

async function getFileMetadata(filePath: string, _form: FileAnalysisForm) {
  const stats = await fs.promises.stat(filePath);
  return {
    path: filePath,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
    extension: path.extname(filePath),
    basename: path.basename(filePath),
  };
}

async function analyzeFileContent(filePath: string, _form: FileAnalysisForm) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return {
    path: filePath,
    size: content.length,
    lines: content.split('\n').length,
    words: content.split(/\s+/).length,
    characters: content.length,
    preview: content.substring(0, 500),
  };
}

async function analyzeFileStructure(filePath: string, _form: FileAnalysisForm) {
  const stats = await fs.promises.stat(filePath);
  if (stats.isDirectory()) {
    const files = await fs.promises.readdir(filePath);
    return {
      path: filePath,
      type: 'directory',
      files: files.length,
      contents: files.slice(0, 20),
    };
  } else {
    return {
      path: filePath,
      type: 'file',
      extension: path.extname(filePath),
      basename: path.basename(filePath),
      directory: path.dirname(filePath),
    };
  }
}

export class FileAnalysisExecutor extends BaseNodeExecutor<FileAnalysisForm> {
  constructor() {
    super({
      nodeType: 'fileanalysis',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['filePath'],
    });
  }

  protected async executeLogic(form: FileAnalysisForm, context: ExecutionContext): Promise<any> {
    const filePath = this.processTemplate(form.filePath, context);
    if (!filePath) throw new Error('File path is required for file analysis');
    let result: any;
    switch (form.analysisType) {
      case 'metadata':
        result = await getFileMetadata(filePath, form);
        break;
      case 'content':
        result = await analyzeFileContent(filePath, form);
        break;
      case 'structure':
        result = await analyzeFileStructure(filePath, form);
        break;
      default:
        throw new Error(`Unsupported file analysis type: ${form.analysisType}`);
    }
    return JSON.stringify(result, null, 2);
  }
}

export default FileAnalysisExecutor;
