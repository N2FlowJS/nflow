import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import * as fs from 'fs';
import * as path from 'path';

/**
 * File Analysis Node Definition
 * 
 * Analyze files to get metadata, content analysis, and structure information.
 * Supports various file types and analysis operations.
 * 
 * Configuration:
 * - filePath: Path to file (supports {variable} templates)
 * - analysisType: Type of analysis (metadata, content, structure)
 * - includeHash: Include file hash in metadata (optional)
 * 
 * Analysis Types:
 * - metadata: File size, dates, permissions, type, hash
 * - content: Content analysis, encoding, line count
 * - structure: File structure analysis (for structured files)
 * 
 * Example:
 * ```json
 * {
 *   "filePath": "./uploads/{filename}",
 *   "analysisType": "metadata",
 *   "includeHash": true
 * }
 * ```
 */
export const FileAnalysisNodeDefinition: NodeDefinition = {
  id: 'file-analysis',
  name: 'File Analysis',
  category: NodeCategory.PROCESSING,
  description: 'Analyze files to get metadata, content, and structure information',
  version: '1.0.0',

  inputs: [
    {
      id: 'filePath',
      name: 'File Path',
      type: PortType.TEXT,
      description: 'Path to file (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter file path...' },
    },
    {
      id: 'analysisType',
      name: 'Analysis Type',
      type: PortType.TEXT,
      description: 'Type of analysis to perform',
      required: true,
      defaultValue: 'metadata',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Metadata', value: 'metadata' },
          { label: 'Content', value: 'content' },
          { label: 'Structure', value: 'structure' },
        ],
      },
    },
    {
      id: 'includeHash',
      name: 'Include Hash',
      type: PortType.BOOLEAN,
      description: 'Include file hash in metadata',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Analysis Result',
      type: PortType.JSON,
      description: 'File analysis results',
    },
    {
      id: 'fileSize',
      name: 'File Size',
      type: PortType.NUMBER,
      description: 'File size in bytes',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.filePath) {
      getInputFromTemplate(config.filePath as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...FileAnalysisNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.filePath as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, fileSize: 0 },
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

      const filePath = processTemplate(config.filePath as string, vars);

      if (!filePath) {
        throw new Error('File path is required for file analysis');
      }

      let result: any;

      switch (config.analysisType) {
        case 'metadata':
          result = await getFileMetadata(filePath, config);
          break;
        case 'content':
          result = await analyzeFileContent(filePath, config);
          break;
        case 'structure':
          result = await analyzeFileStructure(filePath, config);
          break;
        default:
          throw new Error(`Unsupported file analysis type: ${config.analysisType}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'fileanalysis');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          fileSize: result.size || 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          filePath,
          analysisType: config.analysisType,
          fileSize: result.size || 0
        }
      };
    } catch (error: unknown) {
      console.error('File analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown file analysis error';

      return {
        outputs: {
          result: null,
          fileSize: 0
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

async function getFileMetadata(filePath: string, config: any) {
  const stats = await fs.promises.stat(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);

  const result: any = {
    filePath,
    filename: basename,
    extension: ext,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile()
  };

  if (config.includeHash) {
    const crypto = await import('crypto');
    const content = await fs.promises.readFile(filePath);
    result.hash = crypto.createHash('sha256').update(content).digest('hex');
  }

  return result;
}

async function analyzeFileContent(filePath: string, _config: any) {
  const stats = await fs.promises.stat(filePath);
  const content = await fs.promises.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  return {
    filePath,
    size: stats.size,
    lineCount: lines.length,
    characterCount: content.length,
    encoding: 'utf8',
    isEmpty: content.trim() === ''
  };
}

async function analyzeFileStructure(filePath: string, _config: any) {
  const stats = await fs.promises.stat(filePath);
  const ext = path.extname(filePath);

  return {
    filePath,
    extension: ext,
    size: stats.size,
    structure: 'Basic file structure',
    note: 'Full structure analysis requires format-specific parsers'
  };
}
