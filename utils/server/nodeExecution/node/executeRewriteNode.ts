import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { RewriteNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';
import { MessagePart } from '../../../../models/MessagePart';
import { llmOpenAI } from '../../../../llm/openai';
import { prisma } from '../../../../lib/prisma';

/**
 * Handler for executing Rewrite nodes
 */
export async function executeRewriteNode(
  node: FlowNode,
  { flow, flowState, input, history }: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as RewriteNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the prompt template
  const inputs: string[] = getInputFromTemplate(form.prompt || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for rewrite',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'rewrite',
        role: 'assistant',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  try {
    // Get conversation history
    const historyMessages = (history || [])
      .slice(-(form.numberHistory || 5))
      .map((msg: MessagePart) => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Prepare variables for template processing
    const vars: Record<string, string> = {
      conversation: historyMessages,
      userInput: input.content || '',
    };

    // Add other variables from flow state
    inputs.forEach((key) => {
      if (flowState.components[key] !== undefined) {
        vars[key] = flowState.components[key].output || '';
      }
    });

    // Process the prompt template
    const processedPrompt = processTemplate(form.prompt || '', vars);

    console.log(`Executing Rewrite node: ${node.id} with prompt: ${processedPrompt}`);

    // Get model ID
    const modelId = form.model;
    if (!modelId) throw new Error('No AI model specified for rewriting');

    // Fetch the model details from the database
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: { provider: true },
    });

    if (!model) throw new Error('Model not found in the database');
    if (!model.provider) throw new Error('Provider not found for this model');

    // Prepare messages for AI
    const messages: MessagePart[] = [
      {
        role: 'system',
        content: processedPrompt,
      },
    ];

    let aiResponse = '';
    const streamCallback = callback
      ? (partial: string) => {
          callback({
            status: 'waiting',
            nextNodes: [],
            flowState,
            nodeInfo: {
              id: node.id,
              name: node.data?.label || node.id,
              type: 'rewrite',
              role: 'assistant',
            },
            execution: {
              output: partial,
              nodeId: node.id,
              nodeName: node.data?.label || node.id,
              startTime: startTime,
            },
          });
        }
      : undefined;

    switch (model.provider.providerType) {
      case 'openai':
        aiResponse = await llmOpenAI.completions(
          model.provider.endpointUrl,
          model.provider.apiKey,
          model.name,
          messages,
          undefined,
          streamCallback
        );
        break;
      case 'openai-compatible':
        aiResponse = await llmOpenAI.completions(
          model.provider.endpointUrl,
          model.provider.apiKey,
          model.name,
          messages,
          undefined,
          streamCallback
        );
        break;
      default:
        return {
          nextNodes: [],
          status: 'error',
          message: `Unsupported provider type: ${model.provider.providerType}`,
          flowState,
          nodeInfo: {
            id: node.id,
            name: node.data?.label || node.id,
            type: 'rewrite',
            role: 'assistant',
          },
          execution: {
            output: `Unsupported provider type: ${model.provider.providerType}`,
            nodeId: node.id,
            nodeName: node.data?.label || node.id,
            startTime: startTime,
            endTime: new Date().toISOString(),
          },
        };
    }

    console.log(`Rewrite node ${node.id} completed: ${aiResponse}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, aiResponse, 'rewrite');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = aiResponse;
      flowState.components[node.id]['type'] = 'rewrite';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'rewrite',
        role: 'assistant',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: aiResponse,
      },
    };
  } catch (error: unknown) {
    console.error('Rewrite execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown rewrite error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Rewrite failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'rewrite',
        role: 'assistant',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}
