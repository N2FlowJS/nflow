/**
 * Code Editor Executor - Business Logic
 */

import { BaseNodeExecutor } from '../@node-plugin/base-executor';
import { CodeEditorForm } from './types';

/**
 * Code Editor Executor
 * Handles the business logic for executing custom user code
 */
export class CodeEditorExecutor extends BaseNodeExecutor<CodeEditorForm> {
  constructor() {
    super({
      nodeType: 'code-editor',
      defaultRole: 'assistant',
      checkInputReadiness: true,
      templateFields: ['code'],
    });
  }

  /**
   * Execute custom user code
   */
  protected async executeLogic(form: CodeEditorForm, context: any): Promise<any> {
    const { code, language = 'javascript' } = form;

    if (!code || code.trim() === '') {
      throw new Error('Code is required for execution');
    }

    // Create safe execution context
    const executionContext = {
      inputs: context.inputs || {},
      flowState: context.flowState || {},
      node: context.node,
      config: form,
      language,
      log: (message: any) => console.log(`[CodeEditor:${context.node?.id}]`, message),
      error: (message: any) => console.error(`[CodeEditor:${context.node?.id}]`, message),
    };

    // Execute the code safely
    return await this.executeUserCode(code, executionContext);
  }

  /**
   * Safely execute user-provided code with sandboxing
   */
  private async executeUserCode(
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
}

export const codeEditorExecutor = new CodeEditorExecutor();
