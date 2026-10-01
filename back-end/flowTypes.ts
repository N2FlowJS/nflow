import type {
  NodeData as BaseNodeData,
  GlobalVariable,
  CustomNodeType,
  CustomEdgeType,
  FlowRuntimeEvent,
  ChatMessage,
} from '@n2flow/types';

export type NodeData = BaseNodeData;

export type { GlobalVariable, FlowRuntimeEvent, ChatMessage };

export type FlowNode = CustomNodeType;

export type FlowEdge = CustomEdgeType;

export interface ExecuteFlowInput {
  userId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  globalVariables?: GlobalVariable[] | undefined;
  flowId?: string | undefined;
  inputMessage?: string | undefined;
  chatHistory?: ChatMessage[] | undefined;
  isSilent?: boolean | undefined;
  apiKey?: string | undefined;
  onEvent?: ((event: FlowRuntimeEvent) => void) | undefined;
  shouldStop?: (() => boolean) | undefined;
}

export interface ExecuteFlowResult {
  events: FlowRuntimeEvent[];
  output: {
    text: string;
  };
}
