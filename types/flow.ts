import { ISender } from '@components/chat/types';
import { ExecutionResult, FlowState } from './flowExecutionTypes';

// Define OpenAI-compatible error structure
export interface OpenAIError {
  message: string;
  type: string;
  code: string;
  param?: string;
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
  id: string;
  created: number;
  model: string;
  object: string;
  choices: Array<{
    index: number;
    delta: { role?: ISender; content?: string; function_call?: any };
    finish_reason: string | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  flowState?: FlowState;
}
