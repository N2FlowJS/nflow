import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { FileReadForm } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileReadExecutor extends BaseNodeExecutor<FileReadForm> {
  constructor() {
    super({
      nodeType: 'fileread',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['filePath'],
    });
  }

  protected async executeLogic(form: FileReadForm, context: ExecutionContext): Promise<any> {
    if (!form.filePath || form.filePath.trim() === '') {
      throw new Error('No file path specified');
    }
    const filePath = this.processTemplate(form.filePath, context);
    const resolvedPath = path.resolve(filePath);
    const allowedBasePath = process.cwd();
    if (!resolvedPath.startsWith(allowedBasePath)) {
      throw new Error('File path outside allowed directory');
    }
    if (form.maxSize) {
      const stats = await fs.stat(resolvedPath);
      if (stats.size > form.maxSize) {
        throw new Error(`File size (${stats.size} bytes) exceeds maximum allowed size (${form.maxSize} bytes)`);
      }
    }
    let fileContent: string;
    const encoding = form.encoding || 'utf8';
    if (encoding === 'base64') {
      const buffer = await fs.readFile(resolvedPath);
      fileContent = buffer.toString('base64');
    } else if (encoding === 'binary') {
      const buffer = await fs.readFile(resolvedPath);
      fileContent = buffer.toString('binary');
    } else {
      fileContent = await fs.readFile(resolvedPath, 'utf8');
    }
    return JSON.stringify({
      content: fileContent,
      path: resolvedPath,
      size: fileContent.length,
    });
  }
}

export default FileReadExecutor;
