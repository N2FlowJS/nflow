/**
 * JSON Parse Node - NEW ARCHITECTURE
 * 
 * Parse, stringify, extract, and validate JSON data.
 * Supports JSON path extraction and validation.
 * 
 * This node handles:
 * - Parsing JSON strings
 * - Stringifying objects
 * - Extracting values by JSON path
 * - Validating JSON format
 * - Merging JSON objects
 */

import {
  NodeDefinition,
  NodeCategory,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports';
import { JsonParseForm } from './types';
import { getInputFromTemplate } from '@n2flowjs/template/template';

/**
 * Extract value from nested object using path (e.g., "user.address.city")
 */

/**
 * JSON Parse Node Definition
 */
export const JsonParseNodeDefinition: NodeDefinition<JsonParseForm> = {
  // Metadata
  id: 'json-parse',
  name: 'JSON Parse',
  category: NodeCategory.TRANSFORM,
  description: 'Parse, stringify, extract, and validate JSON data',
  version: '2.0.0',

  // Visual
  color: '#13c2c2',
  tags: ['json', 'parse', 'stringify', 'extract', 'validate'],

  // Input Ports
  inputs: [
    {
      id: 'jsonData',
      name: 'JSON Data',
      type: PortType.TEXT,
      description: 'JSON string or object. Use {variable} for templates.',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 5,
        placeholder: '{"key": "value"}',
      },
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'JSON operation',
      required: false,
      defaultValue: 'parse',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Parse', value: 'parse' },
          { label: 'Stringify', value: 'stringify' },
          { label: 'Extract', value: 'extract' },
          { label: 'Validate', value: 'validate' },
          { label: 'Merge', value: 'merge' },
        ],
      },
    },
    {
      id: 'jsonPath',
      name: 'JSON Path',
      type: PortType.TEXT,
      description: 'Path for extract operation (e.g., user.address.city)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'user.address.city',
      },
    },
  ] as InputPort[],

  // Output Ports
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.ANY,
      description: 'Parsed/processed result',
      required: true,
    },
    {
      id: 'resultText',
      name: 'Result (Text)',
      type: PortType.TEXT,
      description: 'Result as JSON string',
      required: false,
    },
    {
      id: 'valid',
      name: 'Valid',
      type: PortType.BOOLEAN,
      description: 'Whether JSON is valid (for validate operation)',
      required: false,
    },
  ] as OutputPort[],

  // Dynamic Input Ports
  getDynamicInputs: (config: JsonParseForm) => {
    const variableNames = new Set<string>();
    
    if (config?.jsonData) {
      getInputFromTemplate(config.jsonData).forEach(v => variableNames.add(v));
    }
    if (config?.jsonPath) {
      getInputFromTemplate(config.jsonPath).forEach(v => variableNames.add(v));
    }
    
    const dynamicPorts: InputPort[] = Array.from(variableNames)
      .sort()
      .map(varName => ({
        id: varName,
        name: varName,
        type: PortType.TEXT,
        description: `Template variable: {${varName}}`,
        required: true,
        metadata: {
          isDynamic: true,
          sourceTemplate: 'jsonData/jsonPath',
          sourceVariable: varName,
          inputType: 'text',
        },
      }));
    
    return [
      ...JsonParseNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },

  // Execution Logic
  async execute({ node, inputs, dispatcher }) {
    const { JsonParseExecutor } = await import('./executor');
    const executor = new JsonParseExecutor();
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'developer' as 'developer', content: inputs.jsonData || '' },
    };
    const output = await executor.execute(node, context, dispatcher);
    let result: any = null;
    let resultText = '';
    let valid: boolean | undefined = undefined;
    if (output.execution && output.execution.output) {
      try {
        resultText = output.execution.output;
        result = JSON.parse(output.execution.output);
        if (typeof result === 'object' && result !== null && 'valid' in result) {
          valid = result.valid;
        }
      } catch {
        resultText = output.execution.output;
        result = output.execution.output;
        valid = undefined;
      }
    }
    return {
      outputs: {
        result,
        resultText,
        valid,
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

export default JsonParseNodeDefinition;
