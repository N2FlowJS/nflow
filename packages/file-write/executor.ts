import { BaseNodeExecutor } from '../@node-plugin/base-executor';
import { FileWriteForm } from './types';
import { processTemplate, getInputFromTemplate } from '@n2flowjs/template/template';
import * as fs from 'fs/promises';
import * as path from 'path';

export default class FileWriteExecutor extends BaseNodeExecutor<FileWriteForm> {
  constructor() {
    super({
      nodeType: 'file-write',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['filePath', 'content'],
    });
  }

  protected async executeLogic(form: FileWriteForm, context: any): Promise<string> {
    // Prepare variables for template processing
    const vars: Record<string, string> = {};
    const allVars = [
      ...getInputFromTemplate(form.filePath || ''),
      ...getInputFromTemplate(form.content || ''),
    ];
    allVars.forEach((key) => {
      if (context.flowState.components[key] !== undefined) {
        vars[key] = context.flowState.components[key].output || '';
      }
    });

    if (!form.filePath || form.filePath.trim() === '') {
      throw new Error('No file path specified');
    }
    if (!form.content && form.content !== '') {
      throw new Error('No content specified for file write');
    }

    // Process templates
    const processedFilePath = processTemplate(form.filePath, vars);
    const processedContent = processTemplate(form.content || '', vars);

    // Security check: prevent directory traversal
    const resolvedPath = path.resolve(processedFilePath);
    const allowedBasePath = process.cwd();
    if (!resolvedPath.startsWith(allowedBasePath)) {
      throw new Error('File path outside allowed directory');
    }

    // Check if file exists and overwrite setting
    if (!form.overwrite) {
      try {
        await fs.access(resolvedPath);
        throw new Error('File already exists and overwrite is disabled');
      } catch (accessError: any) {
        if (accessError.code !== 'ENOENT') {
          throw accessError;
        }
      }
    }

    // Ensure directory exists
    const dirPath = path.dirname(resolvedPath);
    await fs.mkdir(dirPath, { recursive: true });

    // Write file content
    const encoding = form.encoding || 'utf8';
    if (encoding === 'base64') {
      const buffer = Buffer.from(processedContent, 'base64');
      await fs.writeFile(resolvedPath, buffer);
    } else if (encoding === 'binary') {
      const buffer = Buffer.from(processedContent, 'binary');
      await fs.writeFile(resolvedPath, buffer);
    } else {
      await fs.writeFile(resolvedPath, processedContent, 'utf8');
    }

    return JSON.stringify({
      path: resolvedPath,
      size: processedContent.length,
      success: true,
    });
  }
}
