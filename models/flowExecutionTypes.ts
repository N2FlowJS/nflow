import { Flow, FlowNode, InputReference, NodeTypeString } from './flowTypes';
import { MessagePart } from './MessagePart';

/**
 * Represents a component in the flow execution
 */
export interface FlowComponent {
  type: NodeTypeString;
  output: string;
  executionTime: number;
  inputFlow: {
    id: string;
    name: string;
  }[];
  inputRefs?: InputReference[];
}

/**
 * Represents the state of a flow execution
 */
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

/**
 * Record of a node execution
 */
export interface NodeExecutionRecord {
  // ID of the executed node
  nodeId: string;

  // Type of the executed node
  nodeType?: NodeTypeString;

  // Output produced by the node
  output: any;

  // Timestamp when the node was executed
  timestamp: string;
}

/**
 * Result of a flow execution step
 */
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

/**
 * Context for flow execution
 */
export interface FlowExecutionContext {
  // The flow being executed
  flow: Flow;

  // The current state of the flow execution
  flowState: FlowState;

  // Optional user input for the current execution step
  input: MessagePart;

  history?: MessagePart[]; // Optional history of messages for the current execution step
}

/**
 * Definition of a user interface for interaction
 */
export interface UserInterfaceDefinition {
  // Type of interface (e.g., text, form, buttons)
  type: 'text' | 'form' | 'buttons';

  // Template for rendering the interface
  template: string;

  // Optional placeholder for text input
  placeholder?: string;

  // Optional additional configuration for the interface
  config?: Record<string, any>;
}

// Define basic history entry
export interface HistoryEntry {
  nodeId: string;
  output: string;
  timestamp: string;
}

// Define user interface object
export interface UserInterface {
  template: string;
  schema?: any;
}

// Define OpenAI error structure
export interface OpenAIError {
  message: string;
  type: string;
  code: string;
}

export interface ConversationState {
  hasReachedFirstInterface: boolean; // Whether we've reached the first interface node
  firstInterfaceId: string | null; // ID of the first interface node
  lastInterfaceId: string | null; // ID of the last interface node we reached
}

export interface NodeInfo {
  id: string;
  name: string;
  type: NodeTypeString;
  role: 'developer' | 'assistant' | 'system' | 'user';
}

export interface FlowExecutionHistoryEntry {
  nodeId?: string;
  nodeType?: string;
  timestamp: string;
  input?: any;
  output?: string;
  status?: 'success' | 'error' | 'skipped';
  message?: string;
}

export type ExecutionStatusType = 'pending' | 'running' | 'completed' | 'error';
