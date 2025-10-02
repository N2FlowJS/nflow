import { Edge, Node } from '@xyflow/react';
import { MessagePart } from '../../models/MessagePart';
export interface NodeDataMap {}

export type NodeData = NodeDataMap[keyof NodeDataMap] | (BaseNodeData<any> & { type: string });
export type FlowNode = Node<NodeData>;

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
export type ExecutionStatus = 'token' | 'error' | 'in_progress' | 'ended' | 'add_message' | 'waiting';

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
// Input/Output reference system - simplified for specific node types
export interface InputReference {
  sourceNodeId: string;
  id: string;
}

export interface BaseForm {
  name: string; // This field is essential for display and node identification
  description?: string; // Make these optional since not all nodes need them
  output?: string;
  role?: 'developer' | 'assistant' | 'system' | 'user';
  inputRefs?: InputReference[]; // Add support for input references
}

// Generic Base Node Data with form type parameter
export type BaseNodeData<TForm = unknown> = {
  label: string;
  id: string;
  position: { x: number; y: number };
  type: NodeTypeString;
  [key: string]: unknown;
  form: TForm;
};
export type NodeTypeString = string & {};


export interface Flow {
  nodes: FlowNode[];
  edges: Edge[];
}

// Node configuration
export interface NodeConfig {
  type: NodeTypeString;
  icon?: React.ReactNode;
  input: string; // Description of what input the node accepts
  output: string; // Description of what output the node produces
  references?: InputReference[]; // Optional references for input/output
  data: Partial<NodeData>;
}
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



// ============================================================================
// NEW NODE ARCHITECTURE (Week 1 Implementation)
// ============================================================================

import type { InputPort, OutputPort } from '../@flow/ports/types';
import type React from 'react';
import { FlowStateDispatcher } from './flow-state-dispatcher';

/**
 * Node categories for organization
 */
export enum NodeCategory {
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESSING = 'processing',
  AI = 'ai',
  DATABASE = 'database',
  API = 'api',
  LOGIC = 'logic',
  TRANSFORM = 'transform',
  UTILITY = 'utility',
}

/**
 * Node execution context - new format with explicit inputs
 */
export interface NodeExecutionContext<TConfig = any> {
  node: FlowNode;
  config: TConfig;
  inputs: Record<string, any>;     // Input port values by port ID
  flowState: any;                  // Flow state (from @n2flowjs/flow)
  dispatcher?: FlowStateDispatcher;
}

/**
 * Node execution result - new format with explicit outputs
 */
export interface NodeExecutionResult {
  outputs: Record<string, any>;    // Output port values by port ID
  status: 'success' | 'error' | 'in_progress';
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Node executor function - new format
 */
export type NodeExecutor<TConfig = any> = (
  context: NodeExecutionContext<TConfig>
) => Promise<NodeExecutionResult>;

/**
 * Node configuration schema
 */
export interface NodeConfigSchema<T = any> {
  properties: Record<string, any>;
  defaults?: Partial<T>;
}

/**
 * Props for node UI component
 */
export interface NodeComponentProps {
  data: any;
  id: string;
  selected?: boolean;
}

/**
 * Props for node form component
 */
export interface NodeFormProps {
  nodeId: string;
  data: any;
  onChange: (data: any) => void;
}

/**
 * Node validator function
 */
export type NodeValidator = (node: FlowNode) => { valid: boolean; error?: string };

/**
 * Node lifecycle hook
 */
export type NodeHook = (context: NodeExecutionContext) => Promise<void>;

/**
 * Complete node definition - NEW ARCHITECTURE
 */
export interface NodeDefinition<TConfig = any> {
  // Metadata
  id: string;                              // Unique node type ID (e.g., 'http-request')
  name: string;                            // Display name (e.g., 'HTTP Request')
  description: string;                     // What this node does
  category: NodeCategory;                  // For organization in UI
  icon?: React.ComponentType;              // Icon component
  color?: string;                          // Theme color
  version?: string;                        // Node version
  
  // Port definitions (NEW!)
  inputs: InputPort[];                     // Input ports
  outputs: OutputPort[];                   // Output ports
  
  // Configuration
  config?: NodeConfigSchema<TConfig>;      // Configuration schema
  
  // Execution (NEW format!)
  execute: NodeExecutor<TConfig>;          // Execution function
  
  // UI Components
  component?: React.ComponentType<NodeComponentProps>;   // Custom node UI
  formComponent?: React.ComponentType<NodeFormProps>;    // Settings form
  
  // Customization (NEW!)
  allowCustomInputs?: boolean;             // User can add custom inputs
  allowCustomOutputs?: boolean;            // User can add custom outputs
  
  // Advanced
  validation?: NodeValidator;              // Validate entire node
  beforeExecute?: NodeHook;                // Hook before execution
  afterExecute?: NodeHook;                 // Hook after execution
  
  // Metadata
  tags?: string[];                         // Tags for search/filter
  deprecated?: boolean;                    // Is this node deprecated?
  experimental?: boolean;                  // Is this experimental?
}

/**
 * Type guard to check if a node uses new definition format
 */
export function isNewNodeDefinition(node: any): node is NodeDefinition {
  return node && 
         typeof node === 'object' && 
         'inputs' in node && 
         'outputs' in node && 
         'execute' in node &&
         Array.isArray(node.inputs) &&
         Array.isArray(node.outputs);
}

