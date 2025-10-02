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
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { TransformForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

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

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get config values (prefer inputs over config)
      let inputData = inputs.inputData !== undefined ? inputs.inputData : config.inputData;
      const transformation = inputs.transformation || config.transformation;
      const transformType = inputs.transformType || config.transformType || 'json';

      // Validate
      if (!inputData && inputData !== 0 && inputData !== false) {
        throw new Error('Input data is required for transformation');
      }

      if (!transformation) {
        throw new Error('Transformation logic is required');
      }

      // Extract template variables from inputData if it's a string
      if (typeof inputData === 'string') {
        const templateVars = new Set<string>();
        getInputFromTemplate(inputData).forEach(v => templateVars.add(v));

        // Build variable map from inputs
        const vars: Record<string, string> = {};
        templateVars.forEach(varName => {
          if (inputs[varName] !== undefined) {
            vars[varName] = String(inputs[varName]);
          }
        });

        // Process template
        if (templateVars.size > 0) {
          inputData = processTemplate(inputData, vars);
        }
      }

      // Parse input data based on type
      let parsedData: any;
      try {
        switch (transformType) {
          case 'json':
          case 'array':
          case 'object':
            if (typeof inputData === 'string') {
              parsedData = JSON.parse(inputData);
            } else {
              parsedData = inputData;
            }
            break;
          case 'text':
          default:
            parsedData = String(inputData);
            break;
        }
      } catch (parseError) {
        throw new Error(`Failed to parse input data as ${transformType}: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
      }

      // Create safe execution environment
      const safeGlobals = {
        JSON,
        Object,
        Array,
        String,
        Number,
        Boolean,
        Math,
        Date,
        RegExp,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
      };

      // Execute transformation
      let transformedData: any;
      try {
        // Wrap transformation in function for safe execution
        const transformFunction = new Function(
          'data',
          ...Object.keys(safeGlobals),
          `"use strict"; return (${transformation});`
        );

        // Execute
        transformedData = transformFunction(parsedData, ...Object.values(safeGlobals));
      } catch (execError) {
        throw new Error(`Transformation execution failed: ${execError instanceof Error ? execError.message : 'Execution error'}`);
      }

      // Format output
      let resultText: string;
      let outputType: string;

      if (typeof transformedData === 'object' && transformedData !== null) {
        resultText = JSON.stringify(transformedData, null, 2);
        outputType = Array.isArray(transformedData) ? 'array' : 'object';
      } else {
        resultText = String(transformedData);
        outputType = typeof transformedData;
      }

      console.log(`[Transform] ${node.id} => ${outputType}, length: ${resultText.length}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'transform');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: transformedData,
          resultText,
          type: outputType,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          transformType,
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
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default TransformNodeDefinition;
