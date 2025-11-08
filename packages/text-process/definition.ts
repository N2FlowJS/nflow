/**
 * Text Process Node - NEW ARCHITECTURE
 * 
 * Text manipulation and processing operations.
 * Supports various string operations including regex.
 * 
 * Operations:
 * - uppercase/lowercase: Case conversion
 * - trim: Remove whitespace
 * - replace: Find and replace
 * - split: Split into array
 * - join: Join array into string
 * - regex: Regular expression matching
 * - substring: Extract substring
 * - length: Get text length
 */

import {
  NodeDefinition,
  NodeCategory,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports';
import { TextProcessForm } from './types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { TextProcessExecutor } from './executor';


/**
 * Text Process Node Definition
 */
export const TextProcessNodeDefinition: NodeDefinition<TextProcessForm> = {
  // Metadata
  id: 'text-process',
  name: 'Text Process',
  category: NodeCategory.TRANSFORM,
  description: 'Process and manipulate text with various operations',
  version: '2.0.0',
  color: '#1890ff',
  tags: ['text', 'string', 'process', 'regex', 'split', 'replace'],

  inputs: [
    {
      id: 'inputText',
      name: 'Input Text',
      type: PortType.TEXT,
      description: 'Text to process. Use {variable} for templates.',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'Enter text to process...'
      }
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Text processing operation',
      required: false,
      defaultValue: 'trim',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Uppercase', value: 'uppercase' },
          { label: 'Lowercase', value: 'lowercase' },
          { label: 'Trim', value: 'trim' },
          { label: 'Replace', value: 'replace' },
          { label: 'Split', value: 'split' },
          { label: 'Join', value: 'join' },
          { label: 'Regex', value: 'regex' },
          { label: 'Substring', value: 'substring' },
          { label: 'Length', value: 'length' }
        ]
      }
    },
    {
      id: 'searchValue',
      name: 'Search Value',
      type: PortType.TEXT,
      description: 'Value to search for (replace operation)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'Search for...'
      }
    },
    {
      id: 'replaceValue',
      name: 'Replace Value',
      type: PortType.TEXT,
      description: 'Value to replace with (replace operation)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'Replace with...'
      }
    },
    {
      id: 'separator',
      name: 'Separator',
      type: PortType.TEXT,
      description: 'Separator for split/join operations',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: ','
      }
    },
    {
      id: 'regexPattern',
      name: 'Regex Pattern',
      type: PortType.TEXT,
      description: 'Regular expression pattern',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '/pattern/flags'
      }
    }
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.TEXT,
      description: 'Processed text result',
      required: true
    },
    {
      id: 'length',
      name: 'Length',
      type: PortType.NUMBER,
      description: 'Length of result',
      required: false
    },
    {
      id: 'matches',
      name: 'Matches',
      type: PortType.ANY,
      description: 'Regex matches (for regex operation)',
      required: false
    }
  ] as OutputPort[],

  getDynamicInputs: (config: TextProcessForm) => {
    const variableNames = new Set<string>();
    if (config?.inputText) {
      getInputFromTemplate(config.inputText).forEach(v => variableNames.add(v));
    }
    if (config?.searchValue) {
      getInputFromTemplate(config.searchValue).forEach(v => variableNames.add(v));
    }
    if (config?.replaceValue) {
      getInputFromTemplate(config.replaceValue).forEach(v => variableNames.add(v));
    }
    if (config?.separator) {
      getInputFromTemplate(config.separator).forEach(v => variableNames.add(v));
    }
    if (config?.regexPattern) {
      getInputFromTemplate(config.regexPattern).forEach(v => variableNames.add(v));
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
          sourceTemplate: 'inputText/searchValue/replaceValue/separator/regexPattern',
          sourceVariable: varName,
          inputType: 'text'
        }
      }));
    return [
      ...TextProcessNodeDefinition.inputs,
      ...dynamicPorts
    ];
  },

  async execute({ node, config, inputs, dispatcher }) {
    const executor = new TextProcessExecutor();
    const form = { ...config, ...inputs };
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: []
      },
      input: { role: 'user' as 'user', content: '' }
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
      let matches;
      if (form.operation === 'regex' && typeof output.execution.output === 'string') {
        try {
          matches = JSON.parse(output.execution.output);
        } catch {
          matches = undefined;
        }
      }
      return {
        outputs: {
          result: output.execution.output,
          length: typeof output.execution.output === 'string' ? output.execution.output.length : 0,
          matches
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          startTime: output.execution.startTime,
          endTime: output.execution.endTime,
          operation: form.operation,
          resultLength: typeof output.execution.output === 'string' ? output.execution.output.length : 0
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          result: '',
          length: 0,
          matches: null
        },
        status: 'error',
        error: `Text processing failed: ${errorMessage}`,
        metadata: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};

export default TextProcessNodeDefinition;
