import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { AgentToolsForm } from './types';

export class AgentToolsExecutor extends BaseNodeExecutor<AgentToolsForm> {
  constructor() {
    super({
      nodeType: 'agent-tools',
      defaultRole: 'developer',
      checkInputReadiness: false, // No input variables needed
    });
  }

  protected async executeLogic(form: AgentToolsForm, _context: ExecutionContext): Promise<string> {
    const { toolIds } = form;

    // Return the selected tool identifiers for downstream Agent nodes
    const enabledTools = toolIds || [];

    return JSON.stringify({
      enabledTools,
      metadata: {
        toolCount: enabledTools.length,
        tools: enabledTools
      }
    });
  }
}

export const agentToolsExecutor = new AgentToolsExecutor();
