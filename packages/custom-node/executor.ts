import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';

export interface CustomNodeForm {
  code: string;
  inputPorts: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  outputPorts: Array<{
    name: string;
    type: string;
  }>;
}

export class CustomNodeExecutor extends BaseNodeExecutor<CustomNodeForm> {
  constructor() {
    super({
      nodeType: 'custom',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: [], // Custom nodes handle their own inputs
    });
  }

  protected async executeLogic(form: CustomNodeForm, context: ExecutionContext): Promise<any> {
    const { code, inputPorts, outputPorts } = form;

    // Create a safe execution context
    const executionContext = {
      inputs: context.resolvedInputs || {},
      outputs: {},
      // Provide utility functions
      console: {
        log: (...args: any[]) => {
          console.log('[Custom Node]', ...args);
        },
        error: (...args: any[]) => {
          console.error('[Custom Node]', ...args);
        },
        warn: (...args: any[]) => {
          console.warn('[Custom Node]', ...args);
        },
      },
      // Safe JSON utilities
      JSON: {
        parse: JSON.parse,
        stringify: JSON.stringify,
      },
      // Safe Date utilities
      Date: Date,
      // Safe Math utilities
      Math: Math,
      // Safe string utilities
      String: String,
      // Safe number utilities
      Number: Number,
      // Safe array utilities
      Array: Array,
      // Safe object utilities
      Object: Object,
    };

    try {
      // Create a function from the user code
      const userFunction = new Function(
        'context',
        'inputs',
        'outputs',
        `
        "use strict";
        ${code}
        `
      );

      // Execute the user code
      const result = userFunction(
        executionContext,
        executionContext.inputs,
        executionContext.outputs
      );

      // Handle both synchronous and asynchronous execution
      const finalResult = result instanceof Promise ? await result : result;

      // Return the outputs
      return executionContext.outputs;

    } catch (error) {
      throw new Error(`Custom node execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const customNodeExecutor = new CustomNodeExecutor();
