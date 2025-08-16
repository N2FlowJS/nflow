import { InputReference } from '@n2flowjs/flow';
import {    NodeTypeString } from './flowTypes';

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



/**
 * Context for flow execution
 */

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

// ---- Legacy compatibility exports ----
// Many packages still import execution-related types from this file. The canonical
// definitions have moved to packages/@flow/type. We re-export them here to avoid
// touching all import sites in one large refactor.
// TODO: Migrate all imports to '../@flow/type' and then remove these re-exports.
export type {
  FlowState,
  ExecutionResult,
  FlowExecutionContext,
  ExecutionStatus,
  NodeInfo,
} from '@n2flowjs/flow/type';
