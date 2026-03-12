export interface NodeData {
  label: string;
  type: string;
  status?: string;
  description?: string;
  params?: Record<string, unknown>;
  configSchema?: Array<{
    label: string;
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    options?: string[];
    value?: string | number | boolean;
    hidden?: boolean;
  }>;
  lastOutput?: unknown;
  lastInput?: unknown;
  errorMessage?: string;
  [key: string]: unknown;
}

export interface FlowNode {
  id: string;
  type?: string;
  data: NodeData;
  parentId?: string;
  [key: string]: unknown;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  [key: string]: unknown;
}

export interface ExecuteFlowInput {
  nodes: FlowNode[];
  edges: FlowEdge[];
  inputMessage?: string;
  isSilent?: boolean;
  apiKey?: string;
  onEvent?: (event: FlowRuntimeEvent) => void;
  shouldStop?: () => boolean;
}

export type FlowRuntimeEvent =
  | { type: 'log'; message: string }
  | { type: 'ping' }
  | { type: 'nodeUpdate'; nodeId: string; data: Partial<NodeData> }
  | { type: 'result'; output: unknown }
  | { type: 'error'; message: string; nodeId?: string };

export interface ExecuteFlowResult {
  events: FlowRuntimeEvent[];
  output: {
    text: string;
  };
}
