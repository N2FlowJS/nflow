import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import FileReadExecutor from './executor';

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

  getDynamicInputs: () => [],

  async execute({ node, inputs, dispatcher }) {
    const executor = new FileReadExecutor();
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
    let content = null;
    let path = '';
    let size = 0;
    if (output.execution && output.execution.output) {
      try {
        parsed = JSON.parse(output.execution.output);
        content = parsed.content;
        path = parsed.path;
        size = parsed.size;
      } catch {
        content = output.execution.output;
        path = '';
        size = 0;
      }
    }
    return {
      outputs: {
        content,
        path,
        size,
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
