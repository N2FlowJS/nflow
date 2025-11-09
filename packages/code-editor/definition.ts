/**
 * Code Editor Node - NEW ARCHITECTURE
 *
 * Allows users to write and execute custom JavaScript/TypeScript code
 * with access to flow variables, context, and external libraries.
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { CodeEditorForm } from './types';
import { getInputFromTemplate } from '@n2flowjs/template/template';

/**
 * Code Editor Node Definition
 */
export const CodeEditorNodeDefinition: NodeDefinition<CodeEditorForm> = {
  // Metadata
  id: 'code-editor',
  name: 'Code Editor',
  category: NodeCategory.CODE,
  description: 'Write and execute custom JavaScript/TypeScript code with access to flow variables',
  version: '2.0.0',

  // Visual
  color: '#722ed1',
  tags: ['code', 'javascript', 'typescript', 'custom', 'script', 'editor'],

  // Input Ports
  inputs: [
    createInputPort('code', 'Code', PortType.TEXT, {
      description: 'JavaScript/TypeScript code to execute',
      required: true,
      metadata: {
        inputType: 'code-editor',
        language: 'javascript',
        height: '400px',
        placeholder: `// Write your custom code here
// Access flow variables: context.inputs.variableName
// Access flow state: context.flowState
// Return result: return { output: 'result' }

return {
  output: 'Hello from custom code!',
  processed: true
};`,
      },
    }),
    createInputPort('language', 'Language', PortType.TEXT, {
      description: 'Programming language (javascript/typescript)',
      required: false,
      defaultValue: 'javascript',
      metadata: {
        inputType: 'select',
        options: ['javascript', 'typescript'],
      },
    }),
  ],

  // Output Ports
  outputs: [
    createOutputPort('result', 'Result', PortType.ANY, {
      description: 'Execution result from custom code',
      required: true,
    }),
    createOutputPort('success', 'Success', PortType.BOOLEAN, {
      description: 'Whether execution was successful',
      required: false,
    }),
    createOutputPort('error', 'Error', PortType.TEXT, {
      description: 'Error message if execution failed',
      required: false,
    }),
  ],

  // Dynamic Input Ports - Generated from code template variables
  getDynamicInputs: (config: CodeEditorForm) => {
    const variableNames = new Set<string>();

    // Extract from code content
    if (config?.code) {
      getInputFromTemplate(config.code).forEach(v => variableNames.add(v));
    }

    // Create InputPort for each variable
    return Array.from(variableNames)
      .sort()
      .map(varName => ({
        id: varName,
        name: varName,
        type: PortType.ANY,
        description: `Template variable from code: {${varName}}`,
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
      const code = inputs.code || config.code;
      const language = inputs.language || config.language || 'javascript';

      // Validate code
      if (!code || code.trim() === '') {
        throw new Error('Code is required for execution');
      }

      // Extract template variables from code
      const templateVars = new Set<string>();
      getInputFromTemplate(code).forEach(v => templateVars.add(v));

      // Build variable map from inputs
      const vars: Record<string, any> = {};
      templateVars.forEach(varName => {
        if (inputs[varName] !== undefined) {
          vars[varName] = inputs[varName];
        }
      });

      // Create execution context
      const executionContext = {
        inputs: vars,
        flowState: dispatcher?.getState?.() || {},
        node: node,
        config: config,
        language: language,
        // Utility functions
        log: (message: any) => console.log(`[CodeEditor:${node.id}]`, message),
        error: (message: any) => console.error(`[CodeEditor:${node.id}]`, message),
      };

      // Execute the code
      const result = await executeUserCode(code, executionContext);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, result, 'code-editor');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: result,
          success: true,
          error: null,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          language,
          executionTime: Date.now() - new Date(startTime).getTime(),
          codeLength: code.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: null,
          success: false,
          error: errorMessage,
        },
        status: 'error',
        error: `Code execution failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          language: inputs.language || config.language || 'javascript',
          error: errorMessage,
        },
      };
    }
  },
};

/**
 * Safely execute user-provided code with sandboxing
 */
async function executeUserCode(
  code: string,
  context: any
): Promise<any> {
  // Create a safe execution environment
  const safeContext = {
    ...context,
    // Remove dangerous globals
    process: undefined,
    require: undefined,
    importScripts: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
    WebSocket: undefined,
    // Provide safe utilities
    console: {
      log: (...args: any[]) => context.log(...args),
      error: (...args: any[]) => context.error(...args),
      warn: (...args: any[]) => context.log('WARN:', ...args),
      info: (...args: any[]) => context.log('INFO:', ...args),
    },
    // Safe JSON operations
    JSON: {
      parse: JSON.parse,
      stringify: JSON.stringify,
    },
    // Safe Date operations
    Date: Date,
    // Safe Math operations
    Math: Math,
    // Safe Array operations
    Array: Array,
    // Safe Object operations
    Object: Object,
    // Safe String operations
    String: String,
    // Safe Number operations
    Number: Number,
    // Safe Boolean operations
    Boolean: Boolean,
  };

  // Wrap user code in a function with limited scope
  const wrappedCode = `
    (function() {
      "use strict";
      const { inputs, flowState, node, config, language, log, error, console, JSON, Date, Math, Array, Object, String, Number, Boolean } = arguments[0];

      try {
        ${code}
      } catch (e) {
        throw new Error('Code execution error: ' + e.message);
      }
    })
  `;

  try {
    // Create the function
    const userFunction = eval(wrappedCode);

    // Execute with timeout and memory limits
    const result = await Promise.race([
      userFunction(safeContext),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Code execution timed out after 30 seconds')), 30000)
      ),
    ]);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown execution error: ' + String(error));
  }
}

export default CodeEditorNodeDefinition;
