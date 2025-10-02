import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * File Write Node Definition
 * 
 * Writes content to file with template support and security checks.
 * Supports multiple encodings, overwrite control, and directory creation.
 * 
 * Configuration:
 * - filePath: Target file path (supports {variable} templates)
 * - content: Content to write (supports {variable} templates)
 * - encoding: File encoding (utf8, base64, binary)
 * - overwrite: Allow overwriting existing file (default: true)
 * - createDirectory: Create parent directories (default: true)
 * 
 * Security:
 * - Path traversal prevention
 * - Overwrite protection
 * - Allowed directory restriction
 * 
 * Example:
 * ```json
 * {
 *   "filePath": "./output/{timestamp}/result.json",
 *   "content": "{jsonData}",
 *   "encoding": "utf8",
 *   "overwrite": true
 * }
 * ```
 */
export const FileWriteNodeDefinition: NodeDefinition = {
  id: 'file-write',
  name: 'File Write',
  category: NodeCategory.UTILITY,
  description: 'Write content to file with template support and security checks',
  version: '1.0.0',

  inputs: [
    {
      id: 'filePath',
      name: 'File Path',
      type: PortType.TEXT,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: './output/file.txt or ./output/{timestamp}/file.json',
      },
    },
    {
      id: 'content',
      name: 'Content',
      type: PortType.TEXT,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 8,
        placeholder: 'Content to write (supports {variable} templates)',
      },
    },
    {
      id: 'encoding',
      name: 'Encoding',
      type: PortType.TEXT,
      defaultValue: 'utf8',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['utf8', 'base64', 'binary'],
      },
    },
    {
      id: 'overwrite',
      name: 'Overwrite',
      type: PortType.BOOLEAN,
      defaultValue: true,
      required: false,
      metadata: {
        inputType: 'checkbox',
      },
    },
    {
      id: 'createDirectory',
      name: 'Create Directory',
      type: PortType.BOOLEAN,
      defaultValue: true,
      required: false,
      metadata: {
        inputType: 'checkbox',
      },
    },
  ],

  outputs: [
    {
      id: 'path',
      name: 'File Path',
      type: PortType.TEXT,
      description: 'Written file path'
    },
    {
      id: 'size',
      name: 'Bytes Written',
      type: PortType.NUMBER,
      description: 'Number of bytes written'
    },
    {
      id: 'success',
      name: 'Success',
      type: PortType.BOOLEAN,
      description: 'Write operation success'
    }
  ],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.filePath) {
      const pathVars = getInputFromTemplate(config.filePath as string);
      pathVars.forEach(v => variableNames.add(v));
    }

    if (config.content) {
      const contentVars = getInputFromTemplate(config.content as string);
      contentVars.forEach(v => variableNames.add(v));
    }

    return Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: false,
      description: `Template variable: {${varName}}`,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.filePath as string) || ''),
      ...getInputFromTemplate((config.content as string) || ''),
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { path: '', size: 0, success: false },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      if (!config.filePath || String(config.filePath).trim() === '') {
        throw new Error('No file path specified');
      }

      if (config.content === undefined) {
        throw new Error('No content specified for file write');
      }

      const processedFilePath = processTemplate(config.filePath as string, vars);
      const processedContent = processTemplate((config.content as string) || '', vars);
      
      // Security check: prevent directory traversal
      const resolvedPath = path.resolve(processedFilePath);
      const allowedBasePath = process.cwd();
      if (!resolvedPath.startsWith(allowedBasePath)) {
        throw new Error('File path outside allowed directory');
      }

      // Check if file exists and overwrite setting
      if (!config.overwrite) {
        try {
          await fs.access(resolvedPath);
          throw new Error('File already exists and overwrite is disabled');
        } catch (accessError: any) {
          if (accessError.code !== 'ENOENT') {
            throw accessError;
          }
        }
      }

      // Ensure directory exists if createDirectory is true
      if (config.createDirectory !== false) {
        const dirPath = path.dirname(resolvedPath);
        await fs.mkdir(dirPath, { recursive: true });
      }

      // Write file content
      const encoding = (config.encoding as string) || 'utf8';
      let bytesWritten = 0;
      
      if (encoding === 'base64') {
        const buffer = Buffer.from(processedContent, 'base64');
        await fs.writeFile(resolvedPath, buffer);
        bytesWritten = buffer.length;
      } else if (encoding === 'binary') {
        const buffer = Buffer.from(processedContent, 'binary');
        await fs.writeFile(resolvedPath, buffer);
        bytesWritten = buffer.length;
      } else {
        await fs.writeFile(resolvedPath, processedContent, 'utf8');
        bytesWritten = Buffer.byteLength(processedContent, 'utf8');
      }

      const result = {
        path: resolvedPath,
        size: bytesWritten,
        success: true,
      };

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'filewrite');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: result,
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          filePath: resolvedPath,
          encoding,
          bytesWritten,
          contentLength: processedContent.length
        }
      };
    } catch (error: unknown) {
      console.error('File Write node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown file write error';

      return {
        outputs: {
          path: '',
          size: 0,
          success: false
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
