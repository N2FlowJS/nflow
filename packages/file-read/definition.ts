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
 * File Read Node Definition
 * 
 * Reads file content with template path support and security checks.
 * Supports multiple encodings and file size limits.
 * 
 * Configuration:
 * - filePath: File path (supports {variable} templates)
 * - encoding: File encoding (utf8, base64, binary)
 * - maxSize: Maximum file size in bytes (optional)
 * 
 * Security:
 * - Path traversal prevention
 * - Size limit enforcement
 * - Allowed directory restriction
 * 
 * Example:
 * ```json
 * {
 *   "filePath": "./data/{userId}/profile.json",
 *   "encoding": "utf8",
 *   "maxSize": 1048576
 * }
 * ```
 */
export const FileReadNodeDefinition: NodeDefinition = {
  id: 'file-read',
  name: 'File Read',
  category: NodeCategory.UTILITY,
  description: 'Read file content with template path support and security checks',
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
        placeholder: './data/file.txt or ./data/{userId}/file.json',
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
      id: 'maxSize',
      name: 'Max Size (bytes)',
      type: PortType.NUMBER,
      defaultValue: 10485760,
      required: false,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 104857600,
      },
    },
  ],

  outputs: [
    {
      id: 'content',
      name: 'File Content',
      type: PortType.TEXT,
      description: 'File content as text'
    },
    {
      id: 'path',
      name: 'File Path',
      type: PortType.TEXT,
      description: 'Resolved file path'
    },
    {
      id: 'size',
      name: 'File Size',
      type: PortType.NUMBER,
      description: 'File size in bytes'
    }
  ],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.filePath) {
      const vars = getInputFromTemplate(config.filePath as string);
      vars.forEach(v => variableNames.add(v));
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

    const templateVars = getInputFromTemplate((config.filePath as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { content: '', path: '', size: 0 },
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

      const processedFilePath = processTemplate(config.filePath as string, vars);
      
      // Security check: prevent directory traversal
      const resolvedPath = path.resolve(processedFilePath);
      const allowedBasePath = process.cwd();
      if (!resolvedPath.startsWith(allowedBasePath)) {
        throw new Error('File path outside allowed directory');
      }

      // Check file size if maxSize is specified
      const stats = await fs.stat(resolvedPath);
      if (config.maxSize && stats.size > (config.maxSize as number)) {
        throw new Error(
          `File size (${stats.size} bytes) exceeds maximum allowed size (${config.maxSize} bytes)`
        );
      }

      // Read file content
      let fileContent: string;
      const encoding = (config.encoding as string) || 'utf8';
      
      if (encoding === 'base64') {
        const buffer = await fs.readFile(resolvedPath);
        fileContent = buffer.toString('base64');
      } else if (encoding === 'binary') {
        const buffer = await fs.readFile(resolvedPath);
        fileContent = buffer.toString('binary');
      } else {
        fileContent = await fs.readFile(resolvedPath, 'utf8');
      }

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, fileContent, 'fileread');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          content: fileContent,
          path: resolvedPath,
          size: stats.size
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          filePath: resolvedPath,
          encoding,
          size: stats.size,
          contentLength: fileContent.length
        }
      };
    } catch (error: unknown) {
      console.error('File Read node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown file read error';

      return {
        outputs: {
          content: `Error: ${errorMessage}`,
          path: '',
          size: 0
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
