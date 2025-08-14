import { getInputs, getQueryFromSource } from '../hooks/useInputReferences';
import { ExecutionResult, FlowExecutionContext } from '../models/flowExecutionTypes';
import { FlowNode, KeywordsNodeData } from '../models/flowTypes';
import { findNextNodes } from './@flow/find-next-node';
import { flowStateReducer } from '../flowStateReducer';
import { FlowStateDispatcher } from './@flow/flow-state-dispatcher';
import { getInputFromTemplate, processTemplate } from './@template-processor/templateProcessor';
import { isNodeReady } from './@flow/is-node-ready';
import { MessagePart } from '../models/MessagePart';
import { llmOpenAI } from '../llm/openai';
import { prisma } from '../lib/prisma';
import { log } from 'console';

/**
 * Handler for executing Keywords nodes
 */
export async function executeKeywordsNode(
  node: FlowNode,
  { flow, flowState, input, history }: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as KeywordsNodeData;
  const startTime = new Date().toISOString();
  const form = data.form || {};
  const historyMessages = (history || [])
    .slice(form.numberHistory || 0)
    .flatMap((msg: MessagePart) => `${msg.role}: ${msg.content}\n`)
    .join('- ');

  const inputs: string[] = getInputFromTemplate(form.prompt || '');
  console.log(`Executing Keywords node: ${node.id} with inputs: ${JSON.stringify(inputs, null, 2)}`);

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input to extract keywords',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'keywords',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input to extract keywords',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }
  console.log(`Node ${node.id} is ready to execute with inputs: ${JSON.stringify(inputs, null, 2)}`);

  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    vars[key] = flowState.components[key]?.output || '';
  });
  vars['conversation'] = historyMessages;
  console.log(`Executing Keywords node: ${node.id} with inputs: ${JSON.stringify(vars, null, 2)}`);
  // Get the input text for keyword extraction
  const nodeInputs = getInputs(node.id, flowState, []);
  const inputText = getQueryFromSource(nodeInputs, flowState) || input.content;

  if (!inputText) {
    throw new Error('No input text available for keyword extraction');
  }

  // Add input text to variables
  vars['conversation'] = historyMessages;

  try {
    const prompt = processTemplate(form.prompt || '', vars);
    console.log(`Executing Keywords node: ${node.id} with prompt: ${prompt}`);
    const message: MessagePart[] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: inputText,
      },
    ];

    // Get model ID
    const modelId = form.model;
    if (!modelId) throw new Error('No AI model specified in the form');

    // Fetch the model details from the database
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: { provider: true },
    });

    if (!model) throw new Error('Model not found in the database');
    if (!model.provider) throw new Error('Provider not found for this model');

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
              type: 'keywords',
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
          message,
          undefined,
          streamCallback
        );
        break;
      case 'openai-compatible':
        aiResponse = await llmOpenAI.completions(
          model.provider.endpointUrl,
          model.provider.apiKey,
          model.name,
          message,
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
            type: 'keywords',
            role: 'developer',
          },
          execution: {
            output: `Unsupported provider type: ${model.provider.providerType}`,
            nodeId: node.id,
            nodeName: node.data?.label || node.id,
            startTime: startTime,
          },
        };
    }
   log(`AI response for Keywords node ${node.id}: ${aiResponse}`);
    // Process keywords response - limit to maxResults
    const maxResults = form.maxResults || 10;
    let keywords = aiResponse
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (keywords.length > maxResults) {
      keywords = keywords.slice(0, maxResults);
    }
    const formattedKeywords = keywords.join(', ');

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedKeywords, 'keywords');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      let updatedState = flowStateReducer(flowState, {
        type: 'SET_NODE_OUTPUT',
        payload: { nodeId: node.id, output: formattedKeywords, nodeType: 'keywords' },
      });

      updatedState = flowStateReducer(updatedState, {
        type: 'SET_CURRENT_NODE',
        payload: { node },
      });

      finalState = updatedState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) throw new Error(`Node ${node.data.label} - No next nodes found in the flow`);

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'keywords',
        role: 'assistant',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: formattedKeywords,
      },
    };
  } catch (error: unknown) {
    throw new Error(`Error extracting keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
