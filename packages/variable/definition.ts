/**
 * Variable Node - NEW ARCHITECTURE
 * 
 * Store, retrieve, and manipulate flow-level variables.
 * Supports set, get, delete, and append operations.
 * 
 * This node handles:
 * - Setting variables with template values
 * - Getting variables with default fallback
 * - Deleting variables from flow state
 * - Appending to array variables
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { VariableForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Variable Node Definition
 */
export const VariableNodeDefinition: NodeDefinition<VariableForm> = {
  // Metadata
  id: 'variable',
  name: 'Variable',
  category: NodeCategory.UTILITY,
  description: 'Store, retrieve, and manipulate flow-level variables',
  version: '2.0.0',

  // Visual
  color: '#13c2c2',
  tags: ['variable', 'storage', 'state', 'data', 'store'],

  // Input Ports (Configuration)
  inputs: [
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      defaultValue: 'set',
      required: true,
      metadata: {
        inputType: 'select',
        options: ['set', 'get', 'delete', 'append'],
      },
    },
    {
      id: 'variableName',
      name: 'Variable Name',
      type: PortType.TEXT,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: 'myVariable',
      },
    },
    {
      id: 'variableValue',
      name: 'Value',
      type: PortType.ANY,
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'Value to set/append. Use {variable} for templates.',
      },
    },
  ],

  // Output Ports
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.TEXT,
      description: 'Operation result as JSON',
    },
    {
      id: 'value',
      name: 'Value',
      type: PortType.ANY,
      description: 'Variable value',
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Operation performed',
    },
  ],

  // Dynamic Input Ports - Generated from value templates
  getDynamicInputs: (config: VariableForm) => {
    const variables = new Set<string>();
    
    // Extract from variableValue
    if (config?.variableValue) {
      getInputFromTemplate(config.variableValue).forEach(v => variables.add(v));
    }
    
    // Extract from defaultValue
    if (config?.defaultValue) {
      getInputFromTemplate(config.defaultValue).forEach(v => variables.add(v));
    }
    
    // Create InputPort for each variable
    return Array.from(variables)
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

  // Execution Logic
  async execute({ node, config, inputs, flowState, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get config values (prefer inputs over config)
      const operation = inputs.operation || config.operation || 'set';
      const variableName = inputs.variableName || config.variableName;
      let variableValue = inputs.variableValue !== undefined ? inputs.variableValue : config.variableValue;
      let defaultValue = inputs.defaultValue !== undefined ? inputs.defaultValue : config.defaultValue;

      // Validate variable name
      if (!variableName) {
        throw new Error('Variable name is required');
      }

      // Extract template variables
      const templateVars = new Set<string>();
      if (typeof variableValue === 'string') {
        getInputFromTemplate(variableValue).forEach(v => templateVars.add(v));
      }
      if (typeof defaultValue === 'string') {
        getInputFromTemplate(defaultValue).forEach(v => templateVars.add(v));
      }

      // Build variable map from inputs
      const vars: Record<string, string> = {};
      templateVars.forEach(varName => {
        if (inputs[varName] !== undefined) {
          vars[varName] = String(inputs[varName]);
        }
      });

      // Process templates
      if (typeof variableValue === 'string' && templateVars.size > 0) {
        variableValue = processTemplate(variableValue, vars);
      }
      if (typeof defaultValue === 'string' && templateVars.size > 0) {
        defaultValue = processTemplate(defaultValue, vars);
      }

      // Initialize flow variables if not exists
      if (!flowState.variables) {
        flowState.variables = {};
      }

      let result: any;
      let outputValue: any;

      switch (operation) {
        case 'set':
          if (variableValue === undefined) {
            throw new Error('Variable value is required for set operation');
          }
          flowState.variables[variableName] = variableValue;
          result = { operation: 'set', variable: variableName, value: variableValue };
          outputValue = variableValue;
          break;

        case 'get':
          const currentValue = flowState.variables[variableName];
          if (currentValue === undefined) {
            outputValue = defaultValue ?? null;
            result = { operation: 'get', variable: variableName, value: outputValue, usedDefault: true };
          } else {
            outputValue = currentValue;
            result = { operation: 'get', variable: variableName, value: outputValue, usedDefault: false };
          }
          break;

        case 'delete':
          const existed = variableName in flowState.variables;
          delete flowState.variables[variableName];
          result = { operation: 'delete', variable: variableName, existed };
          outputValue = null;
          break;

        case 'append':
          if (variableValue === undefined) {
            throw new Error('Variable value is required for append operation');
          }
          if (!flowState.variables[variableName]) {
            flowState.variables[variableName] = [];
          }
          if (Array.isArray(flowState.variables[variableName])) {
            flowState.variables[variableName].push(variableValue);
          } else {
            // Convert to array if not already
            flowState.variables[variableName] = [flowState.variables[variableName], variableValue];
          }
          outputValue = flowState.variables[variableName];
          result = { operation: 'append', variable: variableName, value: outputValue };
          break;

        default:
          throw new Error(`Unsupported variable operation: ${operation}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      console.log(`[Variable] ${operation} ${variableName} => ${JSON.stringify(outputValue)}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'variable');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: resultText,
          value: outputValue,
          operation,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          operation,
          variableName,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: '',
          value: null,
          operation: '',
        },
        status: 'error',
        error: `Variable operation failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default VariableNodeDefinition;
