import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import FileAnalysisExecutor from './executor';

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

  
  async execute({ node, inputs, dispatcher }) {
    const executor = new FileAnalysisExecutor();
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
    let resultObj: any = {};
    let fileSize = 0;
    if (output.execution && output.execution.output) {
      try {
        resultObj = JSON.parse(output.execution.output);
        fileSize = resultObj.size || 0;
      } catch {
        resultObj = output.execution.output;
        fileSize = 0;
      }
    }
    return {
      outputs: {
        result: resultObj,
        fileSize,
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

