/**
 * Code Node Executor - Refactored using BaseNodeExecutor
 * Executes JavaScript code in a sandboxed environment
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { CodeForm } from './types';

/**
 * Code node executor - runs JavaScript in sandbox
 */

export class CodeExecutor extends BaseNodeExecutor<CodeForm> {
  constructor() {
    super({
      nodeType: 'code',
      defaultRole: 'developer',
      checkInputReadiness: false, // Code accesses flowState directly
      templateFields: [], // No template fields
    });
  }

  /**
   * Execute code in sandboxed environment
   */
  protected async executeLogic(form: CodeForm, context: ExecutionContext): Promise<string> {
    const code = form.code || 'return { result: "No code provided" };';
    const timeout = form.timeout || 5000;
    const allowConsole = form.allowConsole || false;

    // Prepare input data for the code
    const inputs = {
      flowState: context.flowState,
      variables: context.flowState.variables,
      components: context.flowState.components,
    };

    // Execute in sandboxed environment
    const result = await this.executeCodeSafely(code, inputs, timeout, allowConsole);

    // Convert result to string
    const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
    return resultText;
  }

  /**
   * Execute code safely with timeout and controlled scope
   */
  private async executeCodeSafely(
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
        // Create safe console (enabled or disabled based on config)
        const safeConsole = allowConsole
          ? console
          : {
              log: () => {},
              error: () => {},
              warn: () => {},
              info: () => {},
              debug: () => {},
            };

        // Create function with controlled scope
        // Only expose safe globals: Math, JSON, Date, Array, Object, String, Number
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

        // Execute the function
        const result = fn(inputs, safeConsole, Math, JSON, Date, Array, Object, String, Number);

        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }
}

// Export singleton instance (optional, for legacy compatibility)
export const codeExecutor = new CodeExecutor();
