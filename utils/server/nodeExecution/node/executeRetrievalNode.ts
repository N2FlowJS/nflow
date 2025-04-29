import { getInputs, getQueryFromSource } from '../../../../hooks/useInputReferences';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { FlowNode, RetrievalNodeData } from '../../../../models/flowTypes';
import { retrieveFromKnowledgeBase } from '../../../../services/knowledgeService';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { isNodeReady } from '../../isNodeReady';

/**
 * Handler for executing Retrieval nodes
 */
export async function executeRetrievalNode(node: FlowNode, { flow, flowState, input }: FlowExecutionContext): Promise<ExecutionResult> {
  const data = node.data as RetrievalNodeData;
  const startTime = new Date().toISOString();
  // Ensure form exists with a default empty object to prevent TypeScript errors
  const form = data.form || {};
  const ready = isNodeReady(node.id, flowState);
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input to retrieve',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input to retrieve',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  }


  const inputs = getInputs(node.id, flowState, []);

  // Get the query - prioritize lastUserInput if available
  const query = getQueryFromSource(inputs, flowState) || input.content;
  if (!query) throw new Error('No query available for retrieval');


  try {
    const knowledgeIds = form.knowledgeIds || [];
    const maxResults = form.maxResults || 3;

    if (knowledgeIds.length === 0) throw new Error('No knowledge base IDs provided for retrieval');



    // Retrieve information from knowledge bases
    const retrievalResults = await Promise.all(
      knowledgeIds.map((knowledgeId) =>
        retrieveFromKnowledgeBase(knowledgeId, query!, {
          maxResults,
          threshold: form.threshold || 0.7,
        })
      )
    );

    // Flatten and limit results
    const allResults = retrievalResults.flat().slice(0, maxResults);

    // Format the results based on the outputFormat setting
    let formattedResults: string;

    formattedResults = allResults.map((result, index) => `[${index + 1}] ${result.text}\nSource: ${result.source}`).join('\n\n');


    flowState.components[node.id]['output'] = formattedResults;
    flowState.components[node.id]['type'] = 'retrieval';
    flowState.components[node.id]['ready'] = true;
    flowState.currentNode = node;

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) throw new Error(`Node ${node.data.label}  No next nodes found in the flow`);

    return {
      status: 'in_progress',
      nextNodes,
      flowState,
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
