/**
 * Loop Node - NEW ARCHITECTURE
 * 
 * Iterate over arrays, objects, or numeric ranges.
 * Supports maxIterations and multiple loop types.
 * 
 * Loop types:
 * - array: Iterate over array elements
 * - object: Iterate over object key-value pairs
 * - range: Iterate over numeric range with step size
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { LoopForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Loop Node Definition
 */
export const LoopNodeDefinition: NodeDefinition<LoopForm> = {
  // Metadata
  id: 'loop',
  name: 'Loop',
  category: NodeCategory.LOGIC,
  description: 'Iterate over arrays, objects, or numeric ranges',
  version: '2.0.0',

  // Visual
  color: '#fa8c16',
  tags: ['loop', 'iteration', 'array', 'object', 'range', 'control'],

  // Input Ports
  inputs: [
    createInputPort('inputData', 'Input Data', PortType.TEXT, {
      description: 'Data to iterate over (array/object/range). Use {variable} for templates.',
      required: true,
    }),
    createInputPort('loopType', 'Loop Type', PortType.TEXT, {
      description: 'Loop type: array, object, range',
      required: false,
      defaultValue: 'array',
    }),
    createInputPort('maxIterations', 'Max Iterations', PortType.NUMBER, {
      description: 'Maximum number of iterations',
      required: false,
      defaultValue: 100,
    }),
  ],

  // Output Ports
  outputs: [
    createOutputPort('result', 'Result', PortType.ANY, {
      description: 'Loop results array',
      required: true,
    }),
    createOutputPort('iterations', 'Iterations', PortType.NUMBER, {
      description: 'Number of iterations completed',
      required: false,
    }),
    createOutputPort('completed', 'Completed', PortType.BOOLEAN, {
      description: 'Whether loop completed successfully',
      required: false,
    }),
  ],

  // Dynamic Input Ports
  getDynamicInputs: (config: LoopForm) => {
    const variables = new Set<string>();
    
    if (config?.inputData) {
      getInputFromTemplate(config.inputData).forEach(v => variables.add(v));
    }
    
    const dynamicPorts = Array.from(variables)
      .sort()
      .map(varName =>
        createInputPort(varName, varName, PortType.TEXT, {
          description: `Template variable: {${varName}}`,
          required: true,
          metadata: {
            isDynamic: true,
            sourceTemplate: 'inputData',
            sourceVariable: varName,
          },
        })
      );
    
    return [
      ...LoopNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      let inputData = inputs.inputData !== undefined ? inputs.inputData : config.inputData;
      const loopType = inputs.loopType || config.loopType || 'array';
      const maxIterations = inputs.maxIterations || config.maxIterations || 100;

      // Validate
      if (!inputData && inputData !== 0 && inputData !== false) {
        throw new Error('Input data is required');
      }

      // Extract template variables
      if (typeof inputData === 'string') {
        const templateVars = new Set<string>();
        getInputFromTemplate(inputData).forEach(v => templateVars.add(v));

        const vars: Record<string, string> = {};
        templateVars.forEach(varName => {
          if (inputs[varName] !== undefined) {
            vars[varName] = String(inputs[varName]);
          }
        });

        if (templateVars.size > 0) {
          inputData = processTemplate(inputData, vars);
        }
      }

      // Parse input data
      let loopData: any;
      try {
        loopData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
      } catch {
        // If parsing fails, treat as comma-separated list
        loopData = String(inputData).split(',').map(item => item.trim());
      }

      const results: any[] = [];
      let iterations = 0;
      const currentIndexVariable = config.currentIndexVariable || 'index';
      const currentItemVariable = config.currentItemVariable || 'item';

      switch (loopType) {
        case 'array':
          if (Array.isArray(loopData)) {
            for (let i = 0; i < Math.min(loopData.length, maxIterations); i++) {
              results.push({
                [currentIndexVariable]: i,
                [currentItemVariable]: loopData[i],
                iteration: i + 1,
              });
              iterations++;
            }
          } else {
            throw new Error('Input data must be an array for array loop type');
          }
          break;

        case 'object':
          if (typeof loopData === 'object' && loopData !== null && !Array.isArray(loopData)) {
            const keys = Object.keys(loopData);
            for (let i = 0; i < Math.min(keys.length, maxIterations); i++) {
              const key = keys[i];
              results.push({
                [currentIndexVariable]: i,
                [currentItemVariable]: { key, value: loopData[key] },
                iteration: i + 1,
              });
              iterations++;
            }
          } else {
            throw new Error('Input data must be an object for object loop type');
          }
          break;

        case 'range':
          const start = config.startIndex || 0;
          const end = config.endIndex || 10;
          const step = config.stepSize || 1;
          for (let i = start; i < Math.min(end, start + maxIterations); i += step) {
            results.push({
              [currentIndexVariable]: i,
              [currentItemVariable]: i,
              iteration: iterations + 1,
            });
            iterations++;
          }
          break;

        default:
          throw new Error(`Unsupported loop type: ${loopType}`);
      }

      const resultText = JSON.stringify({
        iterations,
        results,
        completed: true,
      }, null, 2);

      console.log(`[Loop] ${loopType} => ${iterations} iterations`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'loop');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: results,
          iterations,
          completed: true,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          loopType,
          iterations,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: [],
          iterations: 0,
          completed: false,
        },
        status: 'error',
        error: `Loop execution failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default LoopNodeDefinition;
