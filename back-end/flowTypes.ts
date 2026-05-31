import { NodeData as BaseNodeData, GlobalVariable, CustomNodeType, CustomEdgeType, FlowRuntimeEvent, ChatMessage } from '@n2flow/types';

export type NodeData = BaseNodeData;

export type { GlobalVariable, FlowRuntimeEvent, ChatMessage };

export interface FlowNode extends CustomNodeType {}

export interface FlowEdge extends CustomEdgeType {}


export interface ExecuteFlowInput {
  userId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  globalVariables?: GlobalVariable[];
  flowId?: string;
  inputMessage?: string;
  chatHistory?: ChatMessage[];
  isSilent?: boolean;
  apiKey?: string;
  onEvent?: (event: FlowRuntimeEvent) => void;
  shouldStop?: () => boolean;
}

export interface ExecuteFlowResult {
  events: FlowRuntimeEvent[];
  output: {
    text: string;
  };
}
