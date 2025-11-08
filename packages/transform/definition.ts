/**
 * Transform Node - NEW ARCHITECTURE
 * 
 * Transform data using JavaScript expressions.
 * Supports JSON, arrays, objects, and text transformation.
 * 
 * This node handles:
 * - JSON data transformation
 * - Array mapping and filtering
 * - Object manipulation
 * - Text processing with templates
 * - Safe JavaScript execution
 */

import {
  NodeDefinition,
  NodeCategory,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { TransformForm } from './types';
import { getInputFromTemplate } from '@n2flowjs/template/template';

/**
 * Transform Node Definition
 */
export const TransformNodeDefinition: NodeDefinition<TransformForm> = {
  // Metadata
  id: 'transform',
  name: 'Transform',
  category: NodeCategory.TRANSFORM,
  description: 'Transform data using JavaScript expressions',
  version: '2.0.0',

  // Visual
  color: '#722ed1',
  tags: ['transform', 'map', 'filter', 'process', 'javascript'],

  // Input Ports (Configuration)
  inputs: [
    {
      id: 'inputData',
      name: 'Input Data',
      type: PortType.ANY,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'Data to transform. Use {variable} for templates.',
      },
    },
    {
      id: 'transformation',
      name: 'Transformation',
      type: PortType.TEXT,
      defaultValue: '(data) => data',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 6,
        placeholder: '(data) => data.map(x => x * 2)',
      },
    },
    {
      id: 'transformType',
      name: 'Data Type',
      type: PortType.TEXT,
      defaultValue: 'json',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['json', 'array', 'object', 'text'],
      },
    },
  ],

  // Output Ports
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.ANY,
      description: 'Transformed data',
    },
    {
      id: 'resultText',
      name: 'Result (Text)',
      type: PortType.TEXT,
      description: 'Result as JSON string',
    },
    {
      id: 'type',
      name: 'Output Type',
      type: PortType.TEXT,
      description: 'Type of transformed data',
    },
  ],

  // Dynamic Input Ports - Generated from inputData template
  getDynamicInputs: (config: TransformForm) => {
    const variableNames = new Set<string>();
    
    // Extract from inputData
    if (config?.inputData) {
      getInputFromTemplate(config.inputData).forEach(v => variableNames.add(v));
    }
    
    // Create InputPort for each variable
    return Array.from(variableNames)
      .sort()
      .map(varName => ({
        id: varName,
        name: varName,
        type: PortType.TEXT,
        description: `Template variable: {${varName}}`,
        required: false,
        metadata: {
          isDynamic: true,
          sourceTemplate: `{${varName}}`,
        },
      }));
  },

  async execute({ node, config, inputs, dispatcher }) {
    const executor = new (await import('./executor')).TransformExecutor();
    const form = { ...config, ...inputs };
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'user' as 'user', content: '' },
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
      let resultText: string;
      let outputType: string;
      if (typeof output.execution.output === 'object' && output.execution.output !== null) {
        resultText = JSON.stringify(output.execution.output, null, 2);
        outputType = Array.isArray(output.execution.output) ? 'array' : 'object';
      } else {
        resultText = String(output.execution.output);
        outputType = typeof output.execution.output;
      }
      return {
        outputs: {
          result: output.execution.output,
          resultText,
          type: outputType,
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          startTime: output.execution.startTime,
          endTime: output.execution.endTime,
          transformType: form.transformType,
          outputType,
          resultLength: resultText.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          result: null,
          resultText: '',
          type: '',
        },
        status: 'error',
        error: `Transform failed: ${errorMessage}`,
        metadata: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default TransformNodeDefinition;
