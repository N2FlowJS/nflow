/**
 * Begin Node Executor - Refactored using BaseNodeExecutor
 * Entry point for flow execution - initializes variables
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { BeginForm } from './types';

/**
 * Begin node executor - initializes flow execution and variables
 */
export class BeginExecutor extends BaseNodeExecutor<BeginForm> {
  constructor() {
    super({
      nodeType: 'begin',
      defaultRole: 'system',
      checkInputReadiness: false, // Begin node doesn't need inputs
      templateFields: [], // No template fields
    });
  }

  /**
   * Execute begin logic - initialize variables and return empty output
   */
  protected async executeLogic(form: BeginForm, context: ExecutionContext): Promise<string> {
    // Initialize variables if defined
    if (context.dispatcher && Array.isArray(form.variables)) {
      const newVariables: Record<string, any> = {};
      
      form.variables.forEach((variable: { title: string; dataIndex: number; key: string }) => {
        // Only add if variable doesn't already exist
        if (variable.title && !context.flowState.variables[variable.title]) {
          newVariables[variable.title] = variable.title || '';
        }
      });

      // Update variables using dispatcher
      if (Object.keys(newVariables).length > 0) {
        context.dispatcher.updateVariables(newVariables);
      }
    }

    // Begin node produces empty output (just signals flow start)
    return '';
  }

  /**
   * Override updateState to handle variables initialization
   */
  protected updateState(
    node: any,
    output: string,
    flowState: any,
    dispatcher?: any
  ): any {
    // Variables already updated in executeLogic, just update node output
    return super.updateState(node, output, flowState, dispatcher);
  }
}

// Export singleton instance
export const beginExecutor = new BeginExecutor();
