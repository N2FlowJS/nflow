import { ExecutionResult } from '../../../types/flowExecutionTypes';

// Define OpenAI-compatible error structure
export interface OpenAIError {
  message: string;
  type: string;
  code: string;
}

// Define what minimal flow state information to expose to the client
export interface ClientFlowState {
  currentNodeId?: string;
  currentNodeName?: string;
  waitingForInput: boolean;
  completed: boolean;
  id?: string; // Changed from conversationId to id for consistency
}

// Extend ExecutionResult to include OpenAI-compatible fields
export interface OpenAIExecutionResult extends Omit<ExecutionResult, 'error'> {
  error?: OpenAIError | string;
  // Additional OpenAI properties
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index: number;
    message?: { role: string; content: string };
    delta?: { role?: string; content?: string };
    finish_reason: string | null;
    text?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  
}
