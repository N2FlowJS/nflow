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
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports';
import { TextProcessForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  // Visual
  color: '#1890ff',
  tags: ['text', 'string', 'process', 'regex', 'split', 'replace'],

  // Input Ports
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
        placeholder: 'Enter text to process...',
      },
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
          { label: 'Length', value: 'length' },
        ],
      },
    },
    {
      id: 'searchValue',
      name: 'Search Value',
      type: PortType.TEXT,
      description: 'Value to search for (replace operation)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'Search for...',
      },
    },
    {
      id: 'replaceValue',
      name: 'Replace Value',
      type: PortType.TEXT,
      description: 'Value to replace with (replace operation)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'Replace with...',
      },
    },
    {
      id: 'separator',
      name: 'Separator',
      type: PortType.TEXT,
      description: 'Separator for split/join operations',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: ',',
      },
    },
    {
      id: 'regexPattern',
      name: 'Regex Pattern',
      type: PortType.TEXT,
      description: 'Regular expression pattern',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '/pattern/flags',
      },
    },
  ] as InputPort[],

  // Output Ports
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.TEXT,
      description: 'Processed text result',
      required: true,
    },
    {
      id: 'length',
      name: 'Length',
      type: PortType.NUMBER,
      description: 'Length of result',
      required: false,
    },
    {
      id: 'matches',
      name: 'Matches',
      type: PortType.ANY,
      description: 'Regex matches (for regex operation)',
      required: false,
    },
  ] as OutputPort[],

  // Dynamic Input Ports
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
          inputType: 'text',
        },
      }));
    
    return [
      ...TextProcessNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      let inputText = inputs.inputText !== undefined ? inputs.inputText : config.inputText;
      const operation = inputs.operation || config.operation || 'trim';

      // Validate
      if (!inputText && inputText !== '') {
        throw new Error('Input text is required');
      }

      // Extract template variables for all fields
      const allTemplateVars = new Set<string>();
      const fields: Array<keyof TextProcessForm> = ['inputText', 'searchValue', 'replaceValue', 'separator', 'regexPattern'];
      
      fields.forEach(field => {
        const value = inputs[field] !== undefined ? inputs[field] : config[field];
        if (value && typeof value === 'string') {
          getInputFromTemplate(value).forEach(v => allTemplateVars.add(v));
        }
      });

      const vars: Record<string, string> = {};
      allTemplateVars.forEach(varName => {
        if (inputs[varName] !== undefined) {
          vars[varName] = String(inputs[varName]);
        }
      });

      // Process templates
      if (typeof inputText === 'string') {
        inputText = processTemplate(inputText, vars);
      }
      
      let searchValue = inputs.searchValue || config.searchValue || '';
      if (typeof searchValue === 'string') {
        searchValue = processTemplate(searchValue, vars);
      }
      
      let replaceValue = inputs.replaceValue || config.replaceValue || '';
      if (typeof replaceValue === 'string') {
        replaceValue = processTemplate(replaceValue, vars);
      }
      
      let separator = inputs.separator || config.separator || '';
      if (typeof separator === 'string') {
        separator = processTemplate(separator, vars);
      }
      
      let regexPattern = inputs.regexPattern || config.regexPattern || '';
      if (typeof regexPattern === 'string') {
        regexPattern = processTemplate(regexPattern, vars);
      }

      let result: string = '';
      let matches: any = null;

      switch (operation) {
        case 'uppercase':
          result = String(inputText).toUpperCase();
          break;

        case 'lowercase':
          result = String(inputText).toLowerCase();
          break;

        case 'trim':
          result = String(inputText).trim();
          break;

        case 'replace':
          if (!searchValue) {
            throw new Error('Search value is required for replace operation');
          }
          result = String(inputText).replace(new RegExp(escapeRegex(searchValue), 'g'), replaceValue);
          break;

        case 'split':
          if (!separator) {
            throw new Error('Separator is required for split operation');
          }
          const splitResult = String(inputText).split(separator);
          result = JSON.stringify(splitResult, null, 2);
          break;

        case 'join':
          try {
            const arrayData = JSON.parse(String(inputText));
            if (!Array.isArray(arrayData)) {
              throw new Error('Input must be a JSON array for join operation');
            }
            result = arrayData.join(separator || ',');
          } catch (error) {
            throw new Error(`Failed to parse input as JSON array: ${error instanceof Error ? error.message : 'Parse error'}`);
          }
          break;

        case 'regex':
          if (!regexPattern) {
            throw new Error('Regex pattern is required for regex operation');
          }
          try {
            const regex = new RegExp(regexPattern, 'g');
            const regexMatches = String(inputText).match(regex);
            matches = regexMatches || [];
            result = JSON.stringify(matches, null, 2);
          } catch (error) {
            throw new Error(`Invalid regex pattern: ${error instanceof Error ? error.message : 'Regex error'}`);
          }
          break;

        case 'substring':
          const startIndex = config.startIndex || 0;
          const endIndex = config.endIndex;
          result = String(inputText).substring(startIndex, endIndex);
          break;

        case 'length':
          result = String(String(inputText).length);
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      console.log(`[Text Process] ${operation} => ${result.length} chars`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, result, 'textprocess');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          length: result.length,
          matches,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          operation,
          resultLength: result.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: '',
          length: 0,
          matches: null,
        },
        status: 'error',
        error: `Text processing failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default TextProcessNodeDefinition;
