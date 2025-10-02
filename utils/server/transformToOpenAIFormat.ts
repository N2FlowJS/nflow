import { EXECUTION_STATUS, ExecutionResult } from '@n2flowjs/flow';
import { OpenAIExecutionResult } from '../../models/flow';

// Transform our result to OpenAI format
export function transformToOpenAIFormat(result: ExecutionResult, conversationId: string): OpenAIExecutionResult {
  // Handle error result - create an error-like OpenAI response
  if (result.status === EXECUTION_STATUS.ERROR) {
    return {
      id: conversationId,
      created: Math.floor(Date.now() / 1000),
      object: 'chat.completion',
      model: 'flow-default',
      flowState: result.flowState, // Include flow state even on error if available
      nodeInfo: result.nodeInfo, // Include node information even on error if available
      choices: [
        {
          index: 0,
          delta: {
            role: 'assistant', // Errors typically come from the assistant/system side
            content: result.message || 'An error occurred during flow execution.',
          },
          finish_reason: 'error', // Use 'error' finish reason
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }

  // Determine finish reason based on status and node type
  let finish_reason: string | null = null;
  if (result.status === EXECUTION_STATUS.ENDED) {
    finish_reason = 'stop';
  } else if (result.status === EXECUTION_STATUS.IN_PROGRESS) {
    finish_reason = null;
  }

  // Handle successful result
  return {
    id: conversationId,
    created: Math.floor(Date.now() / 1000),
    object: 'chat.completion',
    model: 'flow-default',

    choices: [
      {
        index: 0,
        delta: {
          role: result.nodeInfo.role || 'assistant',
          content: result.execution.output || '',
        },
        finish_reason: finish_reason,
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    flowState: result.flowState,
    nodeInfo: result.nodeInfo,
  };
}
