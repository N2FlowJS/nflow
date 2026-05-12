import { NodeData as BaseNodeData, GlobalVariable, CustomNodeType, CustomEdgeType, FlowRuntimeEvent } from '@n2flow/types';

export type NodeData = BaseNodeData;

export type { GlobalVariable, FlowRuntimeEvent };

export interface FlowNode extends CustomNodeType {}

export interface FlowEdge extends CustomEdgeType {}


export interface ExecuteFlowInput {
  nodes: FlowNode[];
  edges: FlowEdge[];
  globalVariables?: GlobalVariable[];
  inputMessage?: string;
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
