import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';

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

  async execute({ node, inputs, dispatcher }) {
    const FileWriteExecutor = (await import('./executor')).default;
    const executor = new FileWriteExecutor();
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'developer' as 'developer', content: inputs.filePath || '' },
    };
    const output = await executor.execute(node, context, dispatcher);
    let parsed: any = {};
    let path = '';
    let size = 0;
    let success = false;
    if (output.execution && output.execution.output) {
      try {
        parsed = JSON.parse(output.execution.output);
        path = parsed.path;
        size = parsed.size;
        success = parsed.success;
      } catch {
        path = '';
        size = 0;
        success = false;
      }
    }
    return {
      outputs: {
        path,
        size,
        success,
      },
      status: output.status === 'error' ? 'error' : 'success',
      metadata: {
        startTime: output.execution?.startTime,
        endTime: output.execution?.endTime,
        message: output.message,
      },
    };
  },
};
