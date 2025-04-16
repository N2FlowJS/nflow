import { ExecutionResult } from './flowExecutionTypes';

// Define OpenAI-compatible error structure
export interface OpenAIError {
  message: string;
  type: string;
  code: string;
  param?: string;
}

// Define what minimal flow state information to expose to the client
export interface ClientFlowState {
  currentNodeId?: string;
  currentNodeName?: string;
  completed: boolean;
  id?: string; // Changed from conversationId to id for consistency
  variables?: Record<string, any>;
}

// Node information in execution response
export interface NodeInfo {
  id: string;
  name: string; 
  type: string;
  role?: string;
}

// Execution information in response
export interface ExecutionInfo {
  output: string;
  nodeId: string;
  nodeName: string;
  startTime: string;
  endTime?: string;
}

// Extend ExecutionResult to include OpenAI-compatible fields
export interface OpenAIExecutionResult {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  status?: string;
  message?: string;
  choices?: Array<{
    index: number;
    message?: { role: string; content: string; function_call?: any };
    delta?: { role?: string; content?: string; function_call?: any };
    finish_reason: string | null;
    text?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  flowState?: ClientFlowState;
  error?: OpenAIError | string;
  nodeInfo?: NodeInfo;
  execution?: ExecutionInfo;
  nextNodeId?: string;
}
