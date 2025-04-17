// This file is part of the Flow Execution API for handling flow execution requests in a Next.js application.

import type { NextApiRequest, NextApiResponse } from 'next';
import { BeginForm, BeginNode, Flow, NODE_TYPES } from '../../../components/agent/types/flowTypes';
import { MessagePart } from '../../../types/MessagePart';
import { OpenAIError, OpenAIExecutionResult } from '../../../types/flow';
import { ExecutionResult, FlowExecutionContext, FlowState } from '../../../types/flowExecutionTypes';
import { continueFlow } from '../../../utils/server/continueFlow';
import { createInitialFlowState } from '../../../utils/server/createInitialFlowState';
import { extractUserInputFromMessages } from '../../../utils/server/extractUserInputFromMessages';
import { getConversationFlowState } from '../../../database/getConversationFlowState';
import { getFlowConfig } from '../../../database/getFlowConfig';
import { AddMessageToDatabase, saveConversationToDatabase } from '../../../database/persistConversationState';
import { transformToOpenAIFormat } from '../../../utils/server/transformToOpenAIFormat';
import { getCurrentNodeId } from '@utils/server/getCurrentNodeId';
import { executeNode } from '@utils/server/executeNode';
import { updateFlowState } from '@utils/server/updateFlowState';

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
        const beginNode = flowConfig.nodes.find((node) => node.type === NODE_TYPES.begin) as BeginNode | undefined;
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
    const userInput = extractUserInputFromMessages(messages);
    if (userInput) {
      message.content = userInput;
      message.role = 'user';

      await AddMessageToDatabase({ conversationId, message });
    }

    if (stream === true && 'writeHead' in res) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });
    }
    const encoder = new TextEncoder();

    const callback = stream
      ? (result: ExecutionResult) => {
          res.write(encoder.encode(`data: ${JSON.stringify(transformToOpenAIFormat(result, conversationId))}\n\n`));

          // Update flow state in database
        }
      : undefined;
    // Transform result to OpenAI format before sending

    // Execute flow based on state
    const result = await continueFlow({
      flow: flowConfig,
      flowState,
      input: message,
      returnResult: true,
      callback,
    });

    // update flow state in database
    if (result.flowState) {
      const persistedId = await saveConversationToDatabase({
        flowState: result.flowState,
        agentId: flowId,
        id: conversationId,
        message: {
          content: result.execution.output || '',
          role: result.nodeInfo.role || 'developer',
        },
      });
      console.log('Flow state persisted with ID:', persistedId);
    }
    if (stream) {
      // End the stream
      res.write(encoder.encode('data: [DONE]\n\n'));
      res.end();
    }
    // Transform result to OpenAI format before sending
    return res.status(200).json(transformToOpenAIFormat(result, conversationId));
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
