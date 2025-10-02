import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { findNextNodes, FlowStateDispatcher, isNodeReady, ResultWaiting } from '@n2flowjs/flow';
import { flowStateReducer } from '../@flow/flow-state-reducer';
import { getInputs, getQueryFromSource } from '../../hooks/useInputReferences';
import { searchSimilarContent } from '../../lib/services/vectorSearchService';
import { RetrievalNodeData } from './types';

/**
 * Handler for executing Retrieval nodes
 */
export async function executeRetrievalNode(
  node: FlowNode,
  { flow, flowState, input }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as RetrievalNodeData;
  const startTime = new Date().toISOString();

  // Ensure form exists with a default empty object to prevent TypeScript errors
  const form = data.form || {};

  // Debug logging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Retrieval Node ${node.id}] Starting execution`);
  }

  const inputs = getInputs(node.id, flowState, []);
  if (!isNodeReady(inputs, flowState)) {
    return ResultWaiting(node, flowState, startTime);
  }
  // Get the query - prioritize from multiple sources
  let query = getQueryFromSource(inputs, flowState);

  // Fallback to input.content
  if (!query && input?.content) {
    query = input.content;
  }

  // Fallback to last message in history
  if (!query && flowState.history && flowState.history.length > 0) {
    // Find the last user message with content
    for (let i = flowState.history.length - 1; i >= 0; i--) {
      const entry = flowState.history[i];
      if (entry && entry.output) {
        query = entry.output;
        break;
      }
    }
  }

  // Fallback to any component output in flowState
  if (!query && flowState.components) {
    const componentIds = Object.keys(flowState.components);
    for (let i = componentIds.length - 1; i >= 0; i--) {
      const comp = flowState.components[componentIds[i]];
      if (comp && comp.output) {
        query = comp.output;
        break;
      }
    }
  }

  if (!query) {
    const errorMsg =
      'No query available for retrieval. Please provide input text or connect to a previous node with output.';
    console.error(`[Retrieval Node ${node.id}] ${errorMsg}`, {
      hasInput: !!input,
      inputContent: input?.content?.substring(0, 100),
      inputsLength: inputs.length,
      historyLength: flowState.history?.length || 0,
      componentsCount: Object.keys(flowState.components || {}).length,
    });
    throw new Error(errorMsg);
  }

  try {
    const knowledgeIds = form.knowledgeIds || [];
    const maxResults = form.maxResults || 3;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Retrieval Node ${node.id}] Query: "${query.substring(0, 100)}..."`);
      console.log(`[Retrieval Node ${node.id}] Knowledge bases: ${knowledgeIds.length}, Max results: ${maxResults}`);
    }

    if (knowledgeIds.length === 0) {
      throw new Error(
        'No knowledge base IDs provided for retrieval. Please configure knowledge bases in the node settings.'
      );
    }

    // Search for similar content

    // Retrieve information from knowledge bases
    const retrievalResults = await Promise.all(
      knowledgeIds.map((knowledgeId) =>
        searchSimilarContent(query, {
          limit: maxResults || 5,
          similarityThreshold: form.threshold || 0.7,
          knowledgeId: knowledgeId,
        }).then((result) => {
          return result.results.map((item) => ({
            text: item.content || '',
            source: item.knowledgeId || 'Unknown source',
            relevance: item.similarity || 0,
          }));
        })
      )
    );

    const allResults = retrievalResults.flat().slice(0, maxResults);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Retrieval Node ${node.id}] Found ${allResults.length} results`);
    }

    const formattedResults = allResults
      .map((result, index) => `[${index + 1}] ${result.text}\nSource: ${result.source}`)
      .join('\n\n');

    // Use shared dispatcher if available, otherwise create local state
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedResults, 'retrieval');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      let updatedState = flowStateReducer(flowState, {
        type: 'SET_NODE_OUTPUT',
        payload: { nodeId: node.id, output: formattedResults, nodeType: 'retrieval' },
      });

      updatedState = flowStateReducer(updatedState, {
        type: 'SET_CURRENT_NODE',
        payload: { node },
      });

      finalState = updatedState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) throw new Error(`Node ${node.data.label}  No next nodes found in the flow`);

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: formattedResults,
      },
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Retrieval Node ${node.id}] Execution failed:`, errorMsg);
    throw new Error(`Error in retrieval node (${node.data?.label || node.id}): ${errorMsg}`);
  }
}
