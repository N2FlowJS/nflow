// Lightweight local type placeholders to avoid deep coupling; refine later
export interface IFlowNodeExecutionContext { [key: string]: any }
export interface IFlowNode<TConfig = any> { id: string; type: string; data?: any; config?: TConfig }

// Contract: The AgentTools node exposes a list of tool definitions that an Agent node can consume.
// The execution simply returns the selected tool identifiers so downstream nodes (Agent) can load them.

export interface AgentToolsConfig { tools: string[] }

export interface AgentToolsNode extends IFlowNode<AgentToolsConfig> { type: 'agenttools' }

export async function executeAgentTools(node: AgentToolsNode, _ctx: IFlowNodeExecutionContext) {
  const tools = (node as any)?.data?.form?.toolIds || [];
  return { enabledTools: tools as string[] };
}

export const availableAgentTools: any[] = [];
