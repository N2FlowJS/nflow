import { OpenAIExecutionResult } from '../../types/flow';
import { ExecutionResult } from '../../types/flowExecutionTypes';

// Transform our result to OpenAI format
export function transformToOpenAIFormat(result: ExecutionResult, conversationId: string): OpenAIExecutionResult {
  // If result already has  properties, cast and return it

  // Handle error result
  if (result.status === 'error') {
    throw new Error(result.message || 'An error occurred');
  }

  return {
    id: conversationId, 
    created: Math.floor(Date.now() / 1000),
    object: 'chat.completion',
    model: 'flow-default',
    flowState: result.flowState,
    choices: [
      {
        index: 0,
        delta: {
          role: result.nodeInfo.role || 'developer',
          content: result.execution.output || '',
        },
        finish_reason: result.status === 'completed' ? 'stop' : result.status === 'in_progress' ? null : 'length',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}
