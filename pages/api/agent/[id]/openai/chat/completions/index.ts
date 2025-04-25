// This file is part of the Flow Execution API for handling flow execution requests in a Next.js application.

import type { NextApiRequest, NextApiResponse } from 'next';
import { BeginForm, BeginNode, Flow, NODE_TYPES } from '@models/flowTypes';
import { MessagePart } from '@models/MessagePart';
import { OpenAIError, OpenAIExecutionResult } from '@models/flow';
import type { ExecutionResult, } from '@models/flowExecutionTypes';
import { executeFlow } from '@utils/server/nodeExecution/executeFlow';
import { createInitialFlowState } from '@utils/server/createInitialFlowState';
import { extractUserInputFromMessages } from '@utils/server/extractUserInputFromMessages';
import { getConversationFlowState } from '@database/getConversationFlowState';
import { getFlowConfig } from '@database/getFlowConfig';
import { AddMessageToDatabase, saveConversationToDatabase } from '@database/persistConversationState';
import { transformToOpenAIFormat } from '@utils/server/transformToOpenAIFormat';
import { FlowNode } from '@models/flowTypes';


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
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse<OpenAIExecutionResult | { error: string | OpenAIError }>) {
  if (req.method !== 'POST') return sendErrorResponse(res, 405, 'Method not allowed', 'invalid_request_error', 'method_not_allowed');
  try {
    let flowId = req.query.id as string;
    const {  variables = {}, stream = false, model = 'default', messages = [], max_tokens: maxTokens = 1024, temperature = 0.7, top_p: topP = 1 } = req.body;
    let { id: conversationId } = req.body;

    if (!flowId) return sendErrorResponse(res, 400, 'Flow ID is required', 'invalid_request_error', 'missing_parameter');
    const message: MessagePart = { role: 'system', content: 'Hello!', };
    const flowConfig: Flow = await getFlowConfig(flowId);
    if (!flowConfig) return sendErrorResponse(res, 404, 'Flow not found', 'invalid_request_error', 'not_found');
    let flowState = conversationId ? await getConversationFlowState(conversationId) : undefined;

    if (!flowState) {
      const beginNode = flowConfig.nodes.find((node: FlowNode) => node.type === NODE_TYPES.begin) as BeginNode | undefined;
      if (!beginNode) return sendErrorResponse(res, 400, 'No begin node found in flow', 'invalid_request_error', 'invalid_flow');
      flowState = createInitialFlowState({ beginNode, variables, flowConfig });
      const newId = await saveConversationToDatabase({ flowState, agentId: flowId, id: conversationId, });
      message.content = (beginNode.data.form as BeginForm)?.greeting || 'Hello!';
      message.role = 'system';
      if (newId !== conversationId) conversationId = newId;
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

    await executeFlow(flowConfig, flowState, message, async function (result: ExecutionResult) {
      if (stream && 'write' in res && result) {
        res.write(encoder.encode(`data: ${JSON.stringify(transformToOpenAIFormat(result, conversationId))}\n\n`));
      }
      if (result.status === 'completed') {
        conversationId = await saveConversationToDatabase({
          flowState: result.flowState,
          agentId: flowId,
          id: conversationId,
          message: {
            content: result.execution.output || '',
            role: result.nodeInfo.role || 'developer',
          },
        });
        console.log('Conversation saved with ID:', conversationId);
        if (stream) {
          res.write(encoder.encode('data: [DONE]\n\n'));
          res.end();
        } else {
          res.status(200).json(transformToOpenAIFormat(result, conversationId));
        }
      }
    });

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
