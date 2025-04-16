// This file is part of the Flow Execution API for handling flow execution requests in a Next.js application.

import { continueExecution, createStreamingResponse } from '@pages/api/flows/until/flowExecution';
import { executeBeginNode, executeCategorizeNode, executeGenerateNode, executeInterfaceNode, executeRetrievalNode } from '@pages/api/flows/until/nodeHandlers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Flow } from '../../../components/agent/types/flowTypes';
import { isBeginNodeData, isCategorizeNodeData, isGenerateNodeData, isInterfaceNodeData, isRetrievalNodeData } from '../../../components/agent/util';
import { ExecutionResult, FlowExecutionContext, FlowState, UserInterface } from '../../../types/flowExecutionTypes';
import { ClientFlowState, OpenAIError, OpenAIExecutionResult } from './type';
import { enrichVariables } from './until/enrichVariables';
import { extractUserInputFromMessages } from './until/extractUserInputFromMessages';
import { getFlowConfig } from './until/getFlowConfig';
import { getConversationFlowState } from './until/getConversationFlowState';
import { persistConversationState } from './until/persistConversationState';

// Constants for flow execution
const NODE_TYPES = {
  BEGIN: 'begin',
  INTERFACE: 'interface',
  GENERATE: 'generate',
  CATEGORIZE: 'categorize',
  RETRIEVAL: 'retrieval',
  USER: 'user',
} as const;

const EXECUTION_STATUS = {
  IN_PROGRESS: 'in_progress',
  WAITING_FOR_INPUT: 'waiting_for_input',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

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
    let { id: conversationId } = req.body; // Destructure to get conversationId and rest of the body
    // Validate required parameters
    if (!flowId) {
      return sendErrorResponse(res, 400, 'Flow ID is required', 'invalid_request_error', 'missing_parameter');
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
        const beginNode = flowConfig.nodes.find((node) => node.type === NODE_TYPES.BEGIN);
        if (!beginNode) {
          return sendErrorResponse(res, 400, 'No begin node found in flow', 'invalid_request_error', 'invalid_flow');
        }

        // Initialize flow state
        flowState = createInitialFlowState(beginNode, variables);

        // Persist conversation and get new ID
        const greeting = isBeginNodeData(beginNode.data) ? beginNode.data.form.greeting : 'Welcome!';
        const newId = await persistConversationState(flowState, flowId, conversationId, greeting);

        // Update ID if it's different
        if (newId !== conversationId) {
          console.log(`Updated conversation ID from ${conversationId} to ${newId}`);
          conversationId = newId;
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        return sendErrorResponse(res, 500, 'Error creating conversation', 'server_error', 'internal_error');
      }
    }

    // Extract user input from messages
    const userInput = extractUserInputFromMessages(messages);

    // Add OpenAI parameters to variables
    const enrichedVariables = enrichVariables(variables, { model, temperature, maxTokens, topP });

    // Handle streaming requests
    if (stream === true && 'writeHead' in res) {
      await handleStreamingWithPersistence(req, res, flowConfig, flowState, userInput, enrichedVariables, { id: conversationId, flowId });
      return;
    }

    // Execute flow based on state
    const result = await continueFlow(res, flowConfig, flowState, userInput, true, true, !flowState ? enrichedVariables : undefined);

    // Persist conversation if needed
    if (result.flowState) {
      try {
        const persistedId = await persistConversationState(result.flowState, flowId, conversationId, userInput);

        // Add conversation ID to result for client reference
        result.id = persistedId;
      } catch (persistError) {
        console.error('Error persisting conversation:', persistError);
        // Continue even if persistence fails
      }
    }

    // Transform result to OpenAI format before sending
    return res.status(200).json(transformToOpenAIFormat(result));
  } catch (error) {
    console.error('Error processing flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return sendErrorResponse(res, 500, `Error processing flow: ${errorMessage}`, 'server_error', 'internal_error');
  }
}

// Helper function to send error responses - change return type to void
function sendErrorResponse(res: NextApiResponse, statusCode: number, message: string, type: string = 'server_error', code: string = 'internal_error'): void {
  // Changed from NextApiResponse to void
  res.status(statusCode).json({
    error: {
      message,
      type,
      code,
    },
  });
  // No return statement needed
}

// Helper to send SSE errors in OpenAI format
function sendSSEError(res: NextApiResponse, message: string) {
  const errorData = {
    error: {
      message,
      type: 'server_error',
      code: 'internal_error',
    },
  };
  res.write(`data: ${JSON.stringify(errorData)}\n\n`);
  res.end();
}

// Transform our result to OpenAI format
function transformToOpenAIFormat(result: ExecutionResult): OpenAIExecutionResult {
  // If result already has OpenAI properties, cast and return it
  const openAIResult = result as any;
  console.log('Transforming result to OpenAI format:', openAIResult);

  // If it already has OpenAI format properties, return as is, but sanitize flowState
  if (openAIResult.choices || (openAIResult.error && typeof openAIResult.error === 'object')) {
    // Create a sanitized version by removing sensitive data
    const sanitizedResult = { ...openAIResult };

    if (sanitizedResult.flowState) {
      sanitizedResult.clientState = extractClientFlowState(sanitizedResult.flowState);
      delete sanitizedResult.flowState;
    }

    return sanitizedResult as OpenAIExecutionResult;
  }

  // Handle error result
  if (result.status === 'error') {
    return {
      ...result,
      error: {
        message: result.message || 'An error occurred',
        type: 'server_error',
        code: 'execution_error',
      },
    };
  }

  // Extract status mappings
  const finishReason = result.status === 'completed' ? 'stop' : result.status === 'waiting_for_input' ? 'function_call' : result.status === 'in_progress' ? null : 'length';

  // Create OpenAI-style response - use existing ID if available
  return {
    id: result.id || `chatcmpl-${Date.now()}`, // Use existing ID if available
    created: Math.floor(Date.now() / 1000),
    object: 'chat.completion',
    model: 'flow-default',
    ...result, // Keep all existing properties

    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: result.output || '',
        },
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}

// Helper to extract client-safe flow state
function extractClientFlowState(flowState: FlowState | null): ClientFlowState | undefined {
  if (!flowState) return undefined;

  return {
    currentNodeId: flowState.currentNodeId,
    currentNodeName: flowState.currentNodeName,
    waitingForInput: !!flowState.conversationState?.hasReachedFirstInterface,
    completed: !!flowState.completed,
    // Don't include conversation ID here - it will be set separately
  };
}

// Modified handler to handle both new and existing flows
async function continueFlow(res: NextApiResponse, flow: Flow, flowState?: FlowState, userInput?: any, returnResult: boolean = false, endWithInterface: boolean = true, initVariables?: Record<string, any>): Promise<ExecutionResult> {
  try {
    // Check if we need to initialize a new flow
    if (!flowState) {
      // Find the BEGIN node - required for new conversations
      const beginNode = flow.nodes.find((node) => node.type === NODE_TYPES.BEGIN);

      if (!beginNode) {
        return createErrorResult('No begin node found in flow. Every flow must have exactly one begin node.', res, returnResult);
      }

      // Create initial flow state
      flowState = createInitialFlowState(beginNode, initVariables);

      // Execute the begin node
      const result = await executeNode(beginNode, { flow, flowState, userInput: undefined });

      if (!result) {
        return createErrorResult('Failed to execute begin node', res, returnResult);
      }

      // Continue execution to the next node (if any)
      if (result.nextNodeId) {
        if (returnResult) {
          return await continueExecutionWithoutRes(flow, flowState, result, endWithInterface);
        } else {
          await continueExecution(res, flow, flowState, result);
          return result;
        }
      }

      return result;
    }

    // Handle existing flow (original continueFlow logic)
    // Check if the flow is already completed
    if (flowState.completed) {
      const completedResult: ExecutionResult = {
        status: EXECUTION_STATUS.COMPLETED,
        flowState,
        message: 'Flow execution already completed',
      };

      if (!returnResult) {
        res.status(200).json(completedResult);
      }
      return completedResult;
    }

    // Start from the last interface node that was reached
    const currentNodeId = flowState.conversationState?.lastInterfaceId || flowState.currentNodeId;
    const currentNode = flow.nodes.find((node) => node.id === currentNodeId);

    if (!currentNode) {
      return createErrorResult(`Node not found: ${currentNodeId}`, res, returnResult);
    }

    // Update flow state and add user input to history
    flowState.currentNodeId = currentNodeId;

    if (userInput) {
      addUserInputToHistory(flowState, userInput);
    }

    // Execute the current node
    const context: FlowExecutionContext = { flow, flowState, userInput };
    const result = await executeNode(currentNode, context);

    if (!result) {
      return createErrorResult(`Failed to execute node: ${currentNode.id}`, res, returnResult);
    }

    // Handle waiting for input status
    if (result.status === EXECUTION_STATUS.WAITING_FOR_INPUT) {
      if (!returnResult) {
        res.status(200).json(result);
      }
      return result;
    }

    // Continue execution through subsequent nodes
    if (returnResult) {
      return await continueExecutionWithoutRes(flow, flowState, result, endWithInterface);
    } else {
      await continueExecution(res, flow, flowState, result);
      return result;
    }
  } catch (error) {
    console.error('Error in flow execution:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResult(`Error in flow execution: ${errorMessage}`, res, returnResult);
  }
}

// Create an initial flow state
function createInitialFlowState(beginNode: any, variables?: Record<string, any>): FlowState {
  return {
    currentNodeId: beginNode.id,
    variables: variables || {},
    history: [
      {
        nodeId: beginNode.id,
        nodeType: NODE_TYPES.BEGIN,
        timestamp: new Date().toISOString(),
        message: 'Flow initialized at begin node',
      },
    ],
    completed: false,
    conversationState: {
      hasReachedFirstInterface: false,
      interfaceNodeCount: 0,
      firstInterfaceId: null,
      lastInterfaceId: null,
    },
  };
}

// Create an error result
function createErrorResult(message: string, res?: NextApiResponse, returnResult: boolean = true): ExecutionResult {
  const errorResult: ExecutionResult = {
    status: EXECUTION_STATUS.ERROR,
    message,
  };

  if (res && !returnResult) {
    res.status(400).json(errorResult);
  }

  return errorResult;
}

// Helper to execute any node type
async function executeNode(node: any, context: FlowExecutionContext): Promise<ExecutionResult | null> {
  try {
    if (isBeginNodeData(node.data)) {
      return await executeBeginNode(node, context);
    } else if (isInterfaceNodeData(node.data)) {
      return await executeInterfaceNode(node, context);
    } else if (isGenerateNodeData(node.data)) {
      return await executeGenerateNode(node, context);
    } else if (isCategorizeNodeData(node.data)) {
      return await executeCategorizeNode(node, context);
    } else if (isRetrievalNodeData(node.data)) {
      return await executeRetrievalNode(node, context);
    }
  } catch (error) {
    console.error(`Error executing ${node.type} node:`, error);
  }

  return null;
}

// Add user input to flow history
function addUserInputToHistory(flowState: FlowState, userInput: any): void {
  flowState.history.push({
    nodeId: 'user-input',
    nodeType: NODE_TYPES.USER,
    input: userInput,
    timestamp: new Date().toISOString(),
  });
}

// Version of continueExecution that doesn't write to response
async function continueExecutionWithoutRes(flow: Flow, flowState: FlowState, result: ExecutionResult, endWithInterface: boolean = true): Promise<ExecutionResult> {
  // Skip if no next node ID
  if (!result.nextNodeId) {
    return result;
  }

  // Create updated flow state
  const updatedFlowState = updateFlowState(flow, flowState, result);

  // Get the next node
  const nextNode = flow.nodes.find((node) => node.id === result.nextNodeId);
  if (!nextNode) {
    return {
      status: EXECUTION_STATUS.ERROR,
      message: `Next node not found: ${result.nextNodeId}`,
      flowState: updatedFlowState,
    };
  }

  // Handle interface nodes specially - they're the conversation boundaries
  if (endWithInterface && nextNode.type === NODE_TYPES.INTERFACE) {
    return await handleInterfaceNode(flow, updatedFlowState, result, nextNode);
  }

  // Execute the next node
  const context: FlowExecutionContext = {
    flow,
    flowState: updatedFlowState,
    userInput: undefined,
  };

  const nextResult = await executeNode(nextNode, context);

  if (!nextResult) {
    return {
      status: EXECUTION_STATUS.ERROR,
      message: `Failed to execute node: ${nextNode.id}`,
      flowState: updatedFlowState,
    };
  }

  // Stop if waiting for input or completed
  if (nextResult.status === EXECUTION_STATUS.WAITING_FOR_INPUT || nextResult.status === EXECUTION_STATUS.COMPLETED) {
    return nextResult;
  }

  // Otherwise, continue to the next node
  return await continueExecutionWithoutRes(flow, updatedFlowState, nextResult, endWithInterface);
}

// Update flow state based on execution result
function updateFlowState(flow: Flow, flowState: FlowState, result: ExecutionResult): FlowState {
  // Clone flowState to avoid mutation issues
  const updatedFlowState = { ...flowState };

  // Update with any changes from the result
  if (result.flowState) {
    Object.assign(updatedFlowState, result.flowState);
  }

  // Update current node ID
  updatedFlowState.currentNodeId = result.nextNodeId!;

  // Add output to history if available
  if (result.output) {
    updatedFlowState.history.push({
      nodeId: flowState.currentNodeId,
      output: result.output,
      timestamp: new Date().toISOString(),
      nodeType: flow.nodes.find((n) => n.id === flowState.currentNodeId)?.type || 'unknown',
    });
  }

  return updatedFlowState;
}

// Special handling for interface nodes
async function handleInterfaceNode(flow: Flow, flowState: FlowState, result: ExecutionResult, interfaceNode: any): Promise<ExecutionResult> {
  // Ensure conversation state exists
  if (!flowState.conversationState) {
    flowState.conversationState = {
      hasReachedFirstInterface: false,
      interfaceNodeCount: 0,
      firstInterfaceId: null,
      lastInterfaceId: null,
    };
  }

  // Update interface node tracking
  const isFirstInterface = !flowState.conversationState.hasReachedFirstInterface;
  trackInterfaceNode(flowState, interfaceNode.id, isFirstInterface);

  // Add to history
  flowState.history.push({
    nodeId: interfaceNode.id,
    nodeType: NODE_TYPES.INTERFACE,
    interfacePosition: isFirstInterface ? 'start' : 'end',
    timestamp: new Date().toISOString(),
  });

  // Get interface content by executing it
  const interfaceOutput = await executeInterfaceAndGetOutput(flow, flowState, interfaceNode);
  if (interfaceOutput) {
    result.output = (result.output || '') + interfaceOutput;
  }

  // Get user interface if available
  const userInterface = getInterfaceData(interfaceNode);

  // Return waiting for input
  return {
    status: EXECUTION_STATUS.WAITING_FOR_INPUT,
    message: 'Waiting for user input at interface node',
    output: result.output,
    flowState,
    nextNodeId: interfaceNode.id,
    userInterface,
  };
}

// Track interface node in conversation state
function trackInterfaceNode(flowState: FlowState, nodeId: string, isFirstInterface: boolean): void {
  // Record this interface node ID
  flowState.conversationState!.lastInterfaceId = nodeId;

  // If first interface node, record it
  if (isFirstInterface) {
    flowState.conversationState!.firstInterfaceId = nodeId;
  }

  // Update counter and mark that we've seen an interface
  flowState.conversationState!.interfaceNodeCount += 1;
  flowState.conversationState!.hasReachedFirstInterface = true;
}

// Execute interface node and get its output
async function executeInterfaceAndGetOutput(flow: Flow, flowState: FlowState, interfaceNode: any): Promise<string | undefined> {
  try {
    if (isInterfaceNodeData(interfaceNode.data)) {
      const context: FlowExecutionContext = {
        flow,
        flowState,
        userInput: undefined,
      };

      const result = await executeInterfaceNode(interfaceNode, context);
      return result.output;
    }
  } catch (error) {
    console.warn('Error executing interface node:', error);
  }

  return undefined;
}

// Safely extract user interface data
function getInterfaceData(interfaceNode: any): UserInterface | undefined {
  if (isInterfaceNodeData(interfaceNode.data) && interfaceNode.data.interface) {
    return interfaceNode.data.interface as UserInterface;
  }
  return undefined;
}

/**
 * Simplified stream processing logic
 */
async function processStream(reader: ReadableStreamDefaultReader<Uint8Array>, res: NextApiResponse, responseId: string, options: { model?: string; finalizeAction?: (state: FlowState) => Promise<void> }): Promise<void> {
  let lastFlowState: FlowState | null = null;
  let buffer = '';
  const decoder = new TextDecoder();
  const messageQueue: any[] = [];

  // Function to send queued messages
  const sendMessages = () => {
    if (messageQueue.length === 0) return;

    for (const msg of messageQueue) {
      res.write(`data: ${JSON.stringify(msg)}\n\n`);
    }

    messageQueue.length = 0;
  };

  try {
    // Initial message
    messageQueue.push({
      id: responseId,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: options.model || 'flow-default',
      choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }],
    });
    sendMessages();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Final message
        messageQueue.push({
          id: responseId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: options.model || 'flow-default',
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        });

        // Run finalize action if provided
        if (options.finalizeAction && lastFlowState) {
          await options.finalizeAction(lastFlowState);
        }

        sendMessages();
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }

      // Process chunk
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (!event.trim()) continue;

        try {
          const match = event.match(/^data: (.+)$/m);
          if (!match) continue;

          const data = JSON.parse(match[1]);

          // Update state if available
          if (data.flowState) {
            lastFlowState = data.flowState;
          }

          // Format as OpenAI response
          messageQueue.push({
            id: responseId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: options.model || 'flow-default',
            choices: [
              {
                index: 0,
                delta: { content: data.output || '' },
                finish_reason: null,
              },
            ],
            clientState: lastFlowState ? extractClientFlowState(lastFlowState) : undefined,
            nodeInfo: data.nodeInfo,
          });

          // Handle completion statuses
          if (data.status === 'completed' || data.status === 'waiting_for_input') {
            messageQueue.push({
              id: responseId,
              status: data.status,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: options.model || 'flow-default',
              choices: [
                {
                  index: 0,
                  delta: {},
                  finish_reason: data.status === 'completed' ? 'stop' : 'function_call',
                },
              ],
              clientState: lastFlowState ? extractClientFlowState(lastFlowState) : undefined,
            });
          }

          // Send messages if there are enough
          if (messageQueue.length >= 3) {
            sendMessages();
          }
        } catch (e) {
          // Skip invalid events
        }
      }
    }
  } catch (error) {
    console.error('Stream processing error:', error);
    res.write(
      `data: ${JSON.stringify({
        error: {
          message: `Stream error: ${error instanceof Error ? error.message : 'Unknown'}`,
          type: 'server_error',
          code: 'stream_processing_error',
        },
      })}\n\n`
    );
    res.end();
  }
}

/**
 * Simplified streaming handler
 */
async function handleStreamingWithPersistence(req: NextApiRequest, res: NextApiResponse, flow: Flow, flowState?: FlowState, userInput?: any, variables?: Record<string, any>, persistenceInfo?: { id?: string; flowId: string }): Promise<void> {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  // Initialize or continue flow
  let initialFlowState: FlowState;
  let initialResult: ExecutionResult;

  if (!flowState) {
    // New flow
    const beginNode = flow.nodes.find((node) => node.type === 'begin');
    if (!beginNode) {
      sendSSEError(res, 'No begin node found');
      return;
    }

    // Create state and execute begin node
    initialFlowState = {
      currentNodeId: beginNode.id,
      variables: variables || {},
      history: [],
      completed: false,
    };

    const context = { flow, flowState: initialFlowState, userInput: undefined };
    initialResult = await executeBeginNode(beginNode, context);
  } else {
    // Continue existing flow
    initialFlowState = flowState;

    // Add user input if provided
    if (userInput) {
      initialFlowState.variables.userInput = userInput;
      addUserInputToHistory(initialFlowState, userInput);
    }

    // Create stub result to continue
    initialResult = {
      status: 'in_progress',
      output: userInput || '',
      nextNodeId: initialFlowState.currentNodeId,
      flowState: initialFlowState,
    };
  }

  // Create streaming response
  const streamingResponse = createStreamingResponse(flow, initialFlowState, initialResult);

  if (streamingResponse.body) {
    const reader = streamingResponse.body.getReader();
    const responseId = persistenceInfo?.id || `chatcmpl-${Date.now()}`;

    // Create persistence finalizer
    const finalizePersistence = async (finalState: FlowState) => {
      if (persistenceInfo) {
        try {
          const id = await persistConversationState(finalState, persistenceInfo.flowId, persistenceInfo.id, userInput);

          res.write(
            `data: ${JSON.stringify({
              id,
              persistenceStatus: 'success',
            })}\n\n`
          );
        } catch (error) {
          res.write(
            `data: ${JSON.stringify({
              persistenceStatus: 'error',
              error: 'Failed to persist conversation',
            })}\n\n`
          );
        }
      }
    };

    // Process with optimized stream handler
    await processStream(reader, res, responseId, {
      model: req.body.model || 'flow-default',
      finalizeAction: finalizePersistence,
    });
  } else {
    sendSSEError(res, 'Failed to create streaming response');
  }
}
