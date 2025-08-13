import { FlowComponent, FlowExecutionHistoryEntry } from "../../models/flowExecutionTypes";
import { Flow, FlowNode, NodeTypeString } from "../../models/flowTypes";
import { MessagePart } from "../../models/MessagePart";

export interface NodeInfo {
  id: string;
  name: string;
  type: NodeTypeString;
  role: 'developer' | 'assistant' | 'system' | 'user';
}

export interface FlowState {
  // The ID of the currently executing node
  currentNode: FlowNode;
  executionTime: number;


  // Components in the flow with their execution state
  components: Record<string, FlowComponent>;

  // The name of the currently executing node

  // Variables that can be referenced throughout the flow
  variables: Record<string, any>;

  // History of node executions
  history: FlowExecutionHistoryEntry[];
}
export type ExecutionStatus = 'completed' | 'error' | 'in_progress' | 'waiting';

export interface ExecutionResult {
  // Status of the execution
  status: ExecutionStatus;
  // Optional message providing additional information
  message?: string;
  // Optional output from the current node
  nextNodes: string[];

  // Optional updated flow state
  flowState: FlowState;

  // Optional node information
  nodeInfo: NodeInfo;

  // Optional execution status
  execution: {
    nodeId: string;
    nodeName: string;
    startTime: string;
    endTime?: string;
    output: string;
  };
}

export interface FlowExecutionContext {
  // The flow being executed
  flow: Flow;

  // The current state of the flow execution
  flowState: FlowState;

  // Optional user input for the current execution step
  input: MessagePart;

  history?: MessagePart[]; // Optional history of messages for the current execution step
}
