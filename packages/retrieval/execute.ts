import { getInputs, getQueryFromSource } from '../../hooks/useInputReferences';
import { searchSimilarContent } from '../../lib/services/vectorSearchService';
import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { RetrievalNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { findNextNodes, FlowStateDispatcher } from '@n2flowjs/flow';
import { flowStateReducer } from '@n2flowjs/flow/flow-state-reducer';

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

  const inputs = getInputs(node.id, flowState, []);

  // Get the query - prioritize lastUserInput if available
  const query = getQueryFromSource(inputs, flowState) || input.content;
  if (!query) throw new Error('No query available for retrieval');

  try {
    const knowledgeIds = form.knowledgeIds || [];
    const maxResults = form.maxResults || 3;

    if (knowledgeIds.length === 0) throw new Error('No knowledge base IDs provided for retrieval');

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
    throw new Error(`Error in retrieval node: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
