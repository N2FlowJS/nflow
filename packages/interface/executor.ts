import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { InterfaceForm } from './types';

export class InterfaceExecutor extends BaseNodeExecutor<InterfaceForm> {
  constructor() {
    super({
      nodeType: 'interface',
      defaultRole: 'developer',
      checkInputReadiness: false, // Display node doesn't need input readiness
    });
  }

  protected async executeLogic(form: InterfaceForm, context: ExecutionContext): Promise<string> {
    const { displayFormat } = form;

    // Interface node just passes through data for display
    // The actual display logic is handled by the frontend
    return JSON.stringify({
      displayFormat: displayFormat || 'text',
      timestamp: new Date().toISOString(),
      metadata: {
        nodeType: 'interface',
        displayFormat: displayFormat || 'text'
      }
    });
  }
}

export const interfaceExecutor = new InterfaceExecutor();
