// This file is part of the Flow Execution API for handling flow execution requests in a Next.js application.

import type { NextApiRequest, NextApiResponse } from 'next';
import { BeginForm, BeginNode, Flow } from '../../../components/agent/types/flowTypes';
import { MessagePart } from '../../../types/MessagePart';
import { OpenAIError, OpenAIExecutionResult } from '../../../types/flow';
import { ExecutionResult, FlowState } from '../../../types/flowExecutionTypes';
import { NODE_TYPES } from '../../../utils/NODE_TYPES';
import { continueFlow } from '../../../utils/continueFlow';
import { createInitialFlowState } from '../../../utils/createInitialFlowState';
import { extractUserInputFromMessages } from '../../../utils/extractUserInputFromMessages';
import { getConversationFlowState } from '../../../utils/getConversationFlowState';
import { getFlowConfig } from '../../../utils/getFlowConfig';
import { saveConversationToDatabase } from '../../../utils/persistConversationState';
import { transformToOpenAIFormat } from '../../../utils/transformToOpenAIFormat';
import { get } from 'http';
import { getCurrentNodeId } from '@utils/getCurrentNodeId';
import { addUserInputToHistory } from '@utils/addUserInputToHistory';
import { executeNode } from '@utils/executeNode';
import { updateFlowState } from '@utils/updateFlowState';

// Main handler for OpenAI-compatible flow execution
/**
 * Flow rules:Flow rules:
 * 1. New conversations: Begin node → Process nodes → The first Interface node (stops and waits for input)
 * 2. Continuing conversations: The previously executed interface node → Process nodes → Next Interface node
 * 3. Every flow must have exactly one BEGIN node and at least one INTERFACE node.
 * 4. Interface nodes mark the boundaries where user input is required.
 * 5. The input content of a node is the output of the previous node.
 * 6. Flow state is stored in the database for persistence.
 * 7. Interface node output returns content to the client.
 * 8. User input text is provided to the latest interface node of the flow and processed.
 * 9. Flow state is returned to the client for tracking via the API endpoint /flows/state/[id].
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse<OpenAIExecutionResult | { error: string | OpenAIError }>) {
  if (req.method !== 'POST') {
    return sendErrorResponse(res, 405, 'Method not allowed', 'invalid_request_error', 'method_not_allowed');
  }

  try {
    // Extract request parameters with defaults
    const { flowId, variables = {}, stream = false, model = 'default', messages = [], max_tokens: maxTokens = 1024, temperature = 0.7, top_p: topP = 1 } = req.body;
    let { id: conversationId } = req.body;
    // Validate required parameters
    if (!flowId) {
      return sendErrorResponse(res, 400, 'Flow ID is required', 'invalid_request_error', 'missing_parameter');
    }

    const message: MessagePart = {
      role: 'system',
      content: 'Hello!',
    };

    // Extract user input from messages
    const userInput = extractUserInputFromMessages(messages);
    if (userInput) {
      message.content = userInput;
      message.role = 'user';
    }
    // Get flow configuration and existing state if ID is provided
    const flowConfig = await getFlowConfig(flowId);
    if (!flowConfig) {
      return sendErrorResponse(res, 404, 'Flow not found', 'invalid_request_error', 'not_found');
    }

    // Get existing flow state if ID is provided
    let flowState = conversationId ? await getConversationFlowState(conversationId) : undefined;

    // If ID is provided but flow state not found, create a new conversation
    if (!flowState) {
      try {
        // Create initial flow state
        const beginNode = flowConfig.nodes.find((node) => node.type === NODE_TYPES.BEGIN) as BeginNode | undefined;
        if (!beginNode) return sendErrorResponse(res, 400, 'No begin node found in flow', 'invalid_request_error', 'invalid_flow');

        // Initialize flow state
        flowState = createInitialFlowState(beginNode, variables);

        // Persist conversation and get new ID
        const newId = await saveConversationToDatabase({
          flowState,
          agentId: flowId,
          id: conversationId,
        });
        message.content = (beginNode.data.form as BeginForm)?.greeting || 'Hello!';
        message.role = 'system';

        // Update ID if it's different
        if (newId !== conversationId) conversationId = newId;
      } catch (error) {
        console.error('Error creating conversation:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return sendErrorResponse(res, 500, `Error creating conversation : ${errorMessage}`, 'server_error', 'internal_error');
      }
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    if (stream === true && 'writeHead' in res) {
      await handleStreaming(flowConfig, flowState, message, { id: conversationId, flowId }, res);
    }

    // Execute flow based on state
    const result = await continueFlow({
      flow: flowConfig,
      flowState,
      input: message,
      returnResult: true,
    });

    // update flow state in database
    if (result.flowState) {
      const persistedId = await saveConversationToDatabase({
        flowState: result.flowState,
        agentId: flowId,
        id: conversationId,
        message: {
          content: result.message || '',
          role: 'assistant',
        },
      });

      // Add conversation ID to result for client reference
      result.id = persistedId;
    }

    // Transform result to OpenAI format before sending
    return res.status(200).json(transformToOpenAIFormat(result));
  } catch (error) {
    console.error('Error processing flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return sendErrorResponse(res, 500, `Error processing flow: ${errorMessage}`, 'server_error', 'internal_error');
  }
}

function sendErrorResponse(res: NextApiResponse, statusCode: number, message: string, type: string = 'server_error', code: string = 'internal_error'): void {
  res.status(statusCode).json({
    error: {
      message,
      type,
      code,
    },
  });
}

async function handleStreaming(flow: Flow, flowState: FlowState, input: MessagePart, persistenceInfo: { id: string; flowId: string }, res: NextApiResponse): Promise<void> {
  // Use response object directly instead of TransformStream
  const encoder = new TextEncoder();

  // Process flow execution in a separate async task
  (async () => {
    try {
      // Set up tracking for the latest flow state
      let currentFlowState: FlowState = { ...flowState };
      let isCompleted = false;

      // Start flow execution as an async generator
      const executionGenerator = processFlowAsGenerator(flow, currentFlowState, input);

      // Process each step in the flow
      for await (const result of executionGenerator) {
        console.log('Streaming result:', result);

        // Update current flow state
        if (result.flowState) {
          currentFlowState = result.flowState;
        }

        // Convert to OpenAI format
        const openAIResponse = transformToOpenAIFormat(result);

        // Write chunk to stream
        res.write(encoder.encode(`data: ${JSON.stringify(openAIResponse)}\n\n`));

        // If flow is completed or waiting for input, mark as done
        if (result.status === 'completed') {
          isCompleted = true;
          break;
        }
      }

      // Persist conversation state if execution completed
      if (isCompleted && persistenceInfo) {
        saveConversationToDatabase({
          flowState: currentFlowState,
          agentId: persistenceInfo.flowId,
          id: persistenceInfo.id,
          message: {
            content: currentFlowState.components[`${currentFlowState.currentNodeId}`]?.output || '',
            role: 'assistant',
          },
        });
      }

      // End the stream
      res.write(encoder.encode('data: [DONE]\n\n'));
      res.end();
    } catch (error) {
      console.error('Streaming error:', error);
      const errorChunk = {
        error: {
          message: error instanceof Error ? error.message : 'Unknown streaming error',
          type: 'server_error',
          code: 'streaming_error',
        },
      };

      res.write(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
      res.end();
    }
  })();
}

/**
 * Process flow execution as an async generator to support streaming
 */
async function* processFlowAsGenerator(flow: Flow, flowState: FlowState, input: MessagePart): AsyncGenerator<ExecutionResult> {
  // Start from the last interface node that was reached
  const currentNode = getCurrentNodeId(flow, flowState.currentNodeId);
  if (!currentNode) {
    yield {
      status: 'error',
      message: `Node not found: ${flowState.currentNodeId}`,
      nodeInfo: {
        id: flowState.currentNodeId || '',
        name: 'Unknown',
        type: 'unknown',
        role: 'developer',
      },
      execution: {
        output: `Node not found: ${flowState.currentNodeId}`,
        nodeId: flowState.currentNodeId || '',
        nodeName: 'Unknown',
        startTime: new Date().toISOString(),
      },
    };
    return;
  }

  // Update flow state with user input if available
  if (input?.content && input.role === 'user') {
    addUserInputToHistory(flowState, input.content);
  }

  // Execute the current node
  const result = await executeNode(currentNode, {
    flow,
    flowState,
    input,
  });

  if (!result) {
    yield {
      status: 'error',
      message: `Failed to execute node: ${currentNode.id}`,
      nodeInfo: {
        id: currentNode.id,
        name: currentNode.data?.label || currentNode.id,
        type: currentNode.type || 'unknown',
        role: 'developer',
      },
      execution: {
        output: `Failed to execute node: ${currentNode.id}`,
        nodeId: currentNode.id,
        nodeName: currentNode.data?.label || currentNode.id,
        startTime: new Date().toISOString(),
      },
    };
    return;
  }

  // Yield the initial result
  yield result;

  // Stop if completed or no next node
  if (result.status === 'completed' || !result.nextNodeId) {
    return;
  }

  // Process subsequent nodes
  let currentResult = result;
  let currentFlowState = flowState;

  // Continue processing next nodes
  while (currentResult?.nextNodeId) {
    // Get the next node
    const nextNode = flow.nodes.find((node) => node.id === currentResult.nextNodeId);
    if (!nextNode) {
      yield {
        status: 'error',
        message: `Next node not found: ${currentResult.nextNodeId}`,
        flowState: currentFlowState,
        nodeInfo: {
          id: currentResult.nextNodeId || '',
          name: 'Unknown',
          type: 'unknown',
          role: 'developer',
        },
        execution: {
          output: `Next node not found: ${currentResult.nextNodeId}`,
          nodeId: currentResult.nextNodeId || '',
          nodeName: 'Unknown',
          startTime: new Date().toISOString(),
        },
      };
      return;
    }

    // Execute the next node
    const context = {
      flow,
      flowState: currentFlowState,
      input: {
        content: currentResult.execution.output || '',
        role: currentResult.nodeInfo.role || 'developer',
      },
    };

    const nextResult = await executeNode(nextNode, context);

    if (!nextResult) {
      yield {
        status: 'error',
        message: `Failed to execute node: ${nextNode.id}`,
        flowState: currentFlowState,
        nodeInfo: {
          id: nextNode.id,
          name: nextNode.data?.label || nextNode.id,
          type: nextNode.type || 'unknown',
          role: 'developer',
        },
        execution: {
          output: `Failed to execute node: ${nextNode.id}`,
          nodeId: nextNode.id,
          nodeName: nextNode.data?.label || nextNode.id,
          startTime: new Date().toISOString(),
        },
      };
      return;
    }

    // Yield the result for this node
    yield nextResult;
    currentResult = nextResult;
    currentFlowState = updateFlowState(currentFlowState, nextResult);
    // Stop if completed
    if (nextResult.status === 'completed') {
      return;
    }
  }
}
