/**
 * Math Node - NEW ARCHITECTURE
 * 
 * Mathematical operations on numbers.
 * Supports basic arithmetic and advanced functions.
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { MathForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Math Node Definition
 */
export const MathNodeDefinition: NodeDefinition<MathForm> = {
  // Metadata
  id: 'math',
  name: 'Math',
  category: NodeCategory.TRANSFORM,
  description: 'Perform mathematical operations',
  version: '2.0.0',

  // Visual
  color: '#13c2c2',
  tags: ['math', 'calculate', 'arithmetic', 'number'],

  // Input Ports
  inputs: [
    createInputPort('value1', 'Value 1', PortType.NUMBER, {
      description: 'First value. Use {variable} for templates.',
      required: true,
    }),
    createInputPort('value2', 'Value 2', PortType.NUMBER, {
      description: 'Second value (if needed)',
      required: false,
    }),
    createInputPort('operation', 'Operation', PortType.TEXT, {
      description: 'Math operation to perform',
      required: false,
      defaultValue: 'add',
    }),
  ],

  // Output Ports
  outputs: [
    createOutputPort('result', 'Result', PortType.NUMBER, {
      description: 'Calculation result',
      required: true,
    }),
    createOutputPort('resultText', 'Result (Text)', PortType.TEXT, {
      description: 'Result as text',
      required: false,
    }),
  ],

  // Dynamic Input Ports
  getDynamicInputs: (config: MathForm) => {
    const variables = new Set<string>();
    
    if (config?.value1) {
      getInputFromTemplate(String(config.value1)).forEach(v => variables.add(v));
    }
    if (config?.value2) {
      getInputFromTemplate(String(config.value2)).forEach(v => variables.add(v));
    }
    
    const dynamicPorts = Array.from(variables)
      .sort()
      .map(varName =>
        createInputPort(varName, varName, PortType.NUMBER, {
          description: `Template variable: {${varName}}`,
          required: true,
          metadata: {
            isDynamic: true,
            sourceTemplate: 'value1/value2',
            sourceVariable: varName,
          },
        })
      );
    
    return [
      ...MathNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },

  // Configuration Schema
  config: {
    properties: {
      value1: {
        type: 'string',
        description: 'First value (supports template variables)',
      },
      value2: {
        type: 'string',
        description: 'Second value (supports template variables)',
      },
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'abs', 'round', 'min', 'max'],
        default: 'add',
        description: 'Mathematical operation',
      },
      precision: {
        type: 'number',
        minimum: 0,
        maximum: 10,
        default: 2,
        description: 'Decimal precision',
      },
    },
  },

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      let value1Str = String(inputs.value1 !== undefined ? inputs.value1 : config.value1 || '0');
      let value2Str = String(inputs.value2 !== undefined ? inputs.value2 : config.value2 || '0');
      const operation = inputs.operation || config.operation || 'add';
      const precision = config.precision !== undefined ? config.precision : 2;

      // Process template variables
      const allTemplateVars = new Set<string>();
      [value1Str, value2Str].forEach(str => {
        if (typeof str === 'string') {
          getInputFromTemplate(str).forEach(v => allTemplateVars.add(v));
        }
      });

      if (allTemplateVars.size > 0) {
        const vars: Record<string, string> = {};
        allTemplateVars.forEach(varName => {
          if (inputs[varName] !== undefined) {
            vars[varName] = String(inputs[varName]);
          }
        });

        value1Str = processTemplate(value1Str, vars);
        value2Str = processTemplate(value2Str, vars);
      }

      // Parse numbers
      const value1 = parseFloat(value1Str);
      const value2 = parseFloat(value2Str);

      if (isNaN(value1)) {
        throw new Error(`Invalid number for value1: ${value1Str}`);
      }

      let result: number;

      switch (operation) {
        case 'add':
          result = value1 + value2;
          break;

        case 'subtract':
          result = value1 - value2;
          break;

        case 'multiply':
          result = value1 * value2;
          break;

        case 'divide':
          if (value2 === 0) {
            throw new Error('Division by zero');
          }
          result = value1 / value2;
          break;

        case 'power':
          result = Math.pow(value1, value2);
          break;

        case 'sqrt':
          if (value1 < 0) {
            throw new Error('Square root of negative number');
          }
          result = Math.sqrt(value1);
          break;

        case 'abs':
          result = Math.abs(value1);
          break;

        case 'round':
          result = Math.round(value1);
          break;

        case 'min':
          result = Math.min(value1, value2);
          break;

        case 'max':
          result = Math.max(value1, value2);
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      // Apply precision
      const formattedResult = parseFloat(result.toFixed(precision));
      const resultText = String(formattedResult);

      console.log(`[Math] ${operation}(${value1}, ${value2}) = ${formattedResult}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'math');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: formattedResult,
          resultText,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          operation,
          value1,
          value2,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: 0,
          resultText: '0',
        },
        status: 'error',
        error: `Math operation failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default MathNodeDefinition;
