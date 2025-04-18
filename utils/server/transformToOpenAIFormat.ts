import { OpenAIExecutionResult } from '../../types/flow';
import { ExecutionResult } from '../../types/flowExecutionTypes';
import { EXECUTION_STATUS } from './EXECUTION_STATUS'; // Import EXECUTION_STATUS

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
  if (result.status === EXECUTION_STATUS.COMPLETED) {
    finish_reason = 'stop'; 
  } else if (result.status === EXECUTION_STATUS.IN_PROGRESS) {
    finish_reason = null; 
  }

  // Handle successful result
  return {
    id: conversationId,
    created: Math.floor(Date.now() / 1000),
    object: 'chat.completion', // Or 'chat.completion.chunk' if streaming chunks, but handled by caller
    model: 'flow-default', // Placeholder model name
    flowState: result.flowState, // Include the latest flow state
    nodeInfo: result.nodeInfo, // Include node information
    choices: [
      {
        index: 0,
        delta: {
          // Use role from nodeInfo if available, default to 'assistant'
          role: result.nodeInfo.role || 'assistant',
          content: result.execution.output || '', // Ensure content is always a string
        },
        finish_reason: finish_reason,
      },
    ],
    // Usage data is currently placeholder, could be implemented if token counting is added
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}
