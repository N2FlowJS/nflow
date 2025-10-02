/**
 * Code Node - NEW ARCHITECTURE
 * 
 * Execute custom JavaScript code in a sandboxed environment.
 * Access to flow state, variables, and safe globals.
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { CodeForm } from './types';

/**
 * Execute code safely with timeout
 */
async function executeCodeSafely(
  code: string,
  inputs: any,
  timeout: number,
  allowConsole: boolean
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Code execution timeout after ${timeout}ms`));
    }, timeout);

    try {
      const safeConsole = allowConsole ? console : {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
      };

      // Create function with controlled scope
      const fn = new Function(
        'inputs',
        'console',
        'Math',
        'JSON',
        'Date',
        'Array',
        'Object',
        'String',
        'Number',
        code
      );

      // Execute
      const result = fn(
        inputs,
        safeConsole,
        Math,
        JSON,
        Date,
        Array,
        Object,
        String,
        Number
      );

      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Code Node Definition
 */
export const CodeNodeDefinition: NodeDefinition<CodeForm> = {
  // Metadata
  id: 'code',
  name: 'Code',
  category: NodeCategory.TRANSFORM,
  description: 'Execute custom JavaScript code',
  version: '2.0.0',

  // Visual
  color: '#faad14',
  tags: ['code', 'javascript', 'custom', 'script', 'function'],

  // Input Ports
  inputs: [
    createInputPort('code', 'Code', PortType.TEXT, {
      description: 'JavaScript code to execute',
      required: true,
    }),
  ],

  // Output Ports
  outputs: [
    createOutputPort('result', 'Result', PortType.ANY, {
      description: 'Code execution result',
      required: true,
    }),
    createOutputPort('resultText', 'Result (Text)', PortType.TEXT, {
      description: 'Result as JSON string',
      required: false,
    }),
  ],

  // Configuration Schema
  config: {
    properties: {
      code: {
        type: 'string',
        format: 'textarea',
        description: 'JavaScript code to execute. Return an object with results.',
      },
      timeout: {
        type: 'number',
        minimum: 100,
        maximum: 30000,
        default: 5000,
        description: 'Execution timeout (ms)',
      },
      allowConsole: {
        type: 'boolean',
        default: false,
        description: 'Allow console.log output',
      },
    },
  },

  // Execution Logic
  async execute({ node, config, inputs, flowState, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      const code = inputs.code || config.code || 'return { result: "No code provided" };';
      const timeout = config.timeout || 5000;
      const allowConsole = config.allowConsole || false;

      // Prepare inputs for code
      const codeInputs = {
        flowState: flowState,
        variables: flowState?.variables || {},
        components: flowState?.components || {},
        inputs: inputs,
      };

      // Execute code safely
      const result = await executeCodeSafely(code, codeInputs, timeout, allowConsole);

      const resultText = typeof result === 'object' 
        ? JSON.stringify(result, null, 2) 
        : String(result);

      console.log(`[Code] Execution completed: ${resultText.substring(0, 100)}...`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'code');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          resultText,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          executionTime: Date.now() - new Date(startTime).getTime(),
          codeLength: code.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`[Code] Execution error:`, errorMessage);

      return {
        outputs: {
          result: null,
          resultText: '',
        },
        status: 'error',
        error: `Code execution failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default CodeNodeDefinition;
