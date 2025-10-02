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
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports';
import { JsonParseForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Extract value from nested object using path (e.g., "user.address.city")
 */
function extractFromPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // Handle array indices: users[0]
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const key = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      current = current[key];
      if (Array.isArray(current)) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }
  
  return current;
}

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
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      let jsonData = inputs.jsonData !== undefined ? inputs.jsonData : config.jsonData;
      const operation = inputs.operation || config.operation || 'parse';
      let jsonPath = inputs.jsonPath || config.jsonPath;

      // Validate
      if (!jsonData && jsonData !== 0 && jsonData !== false) {
        throw new Error('JSON data is required');
      }

      // Extract template variables
      if (typeof jsonData === 'string') {
        const templateVars = new Set<string>();
        getInputFromTemplate(jsonData).forEach(v => templateVars.add(v));

        const vars: Record<string, string> = {};
        templateVars.forEach(varName => {
          if (inputs[varName] !== undefined) {
            vars[varName] = String(inputs[varName]);
          }
        });

        if (templateVars.size > 0) {
          jsonData = processTemplate(jsonData, vars);
        }
      }

      // Process jsonPath template
      if (jsonPath && typeof jsonPath === 'string') {
        const templateVars = new Set<string>();
        getInputFromTemplate(jsonPath).forEach(v => templateVars.add(v));

        const vars: Record<string, string> = {};
        templateVars.forEach(varName => {
          if (inputs[varName] !== undefined) {
            vars[varName] = String(inputs[varName]);
          }
        });

        if (templateVars.size > 0) {
          jsonPath = processTemplate(jsonPath, vars);
        }
      }

      let result: any;
      let resultText: string;
      let isValid = true;

      switch (operation) {
        case 'parse':
          try {
            if (typeof jsonData === 'string') {
              result = JSON.parse(jsonData);
            } else {
              result = jsonData;
            }
            resultText = JSON.stringify(result, null, 2);
          } catch (error) {
            throw new Error(`Invalid JSON data: ${error instanceof Error ? error.message : 'Parse error'}`);
          }
          break;

        case 'stringify':
          try {
            if (typeof jsonData === 'string') {
              const parsed = JSON.parse(jsonData);
              result = JSON.stringify(parsed, null, 2);
            } else {
              result = JSON.stringify(jsonData, null, 2);
            }
            resultText = result;
          } catch (error) {
            result = String(jsonData);
            resultText = result;
          }
          break;

        case 'extract':
          if (!jsonPath) {
            throw new Error('JSON path is required for extract operation');
          }
          try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            result = extractFromPath(data, jsonPath);
            resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
          } catch (error) {
            throw new Error(`Failed to extract from JSON path: ${error instanceof Error ? error.message : 'Extract error'}`);
          }
          break;

        case 'validate':
          try {
            if (typeof jsonData === 'string') {
              JSON.parse(jsonData);
            }
            result = { valid: true, message: 'Valid JSON' };
            resultText = JSON.stringify(result, null, 2);
            isValid = true;
          } catch (error) {
            result = { valid: false, message: error instanceof Error ? error.message : 'Invalid JSON' };
            resultText = JSON.stringify(result, null, 2);
            isValid = false;
          }
          break;

        case 'merge':
          try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            // If merging multiple objects, they should be in an array
            if (Array.isArray(data)) {
              result = Object.assign({}, ...data);
            } else {
              result = data;
            }
            resultText = JSON.stringify(result, null, 2);
          } catch (error) {
            throw new Error(`Failed to merge JSON: ${error instanceof Error ? error.message : 'Merge error'}`);
          }
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      console.log(`[JSON Parse] ${operation} => ${typeof result}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'jsonparse');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          resultText,
          valid: isValid,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          operation,
          resultType: typeof result,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: null,
          resultText: '',
          valid: false,
        },
        status: 'error',
        error: `JSON operation failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default JsonParseNodeDefinition;
