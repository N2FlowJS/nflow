import { FlowNode, RetrievalNodeData, InputReference } from '../../../../types/flowTypes';
import { ExecutionResult, ExecutionStatusType, FlowExecutionContext } from '../../../../types/flowExecutionTypes';
import { retrieveFromKnowledgeBase } from '../../../../services/knowledgeService';
import { findNextNodes } from '@utils/server/findNextNode';
import { getInputFromSource } from '../../../../hooks/useInputReferences';
import { checkReadyForComponentFlowState } from '../../checkReadyForComponentFlowState';

/**
 * Handler for executing Retrieval nodes
 */
export async function executeRetrievalNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState, input } = context;
  const data = node.data as RetrievalNodeData;
  const startTime = new Date().toISOString();
  // Ensure form exists with a default empty object to prevent TypeScript errors
  const form = data.form || {};
  const ready = checkReadyForComponentFlowState(node.id, flowState);
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
      },
    };
  }



  // Get the query - prioritize lastUserInput if available
  let query = getInputFromSource(form.inputRefs, flowState) || input.content;
  console.log(query, 'query from input source');
  if (!query) throw new Error('No query available for retrieval');

  // Fallback to userInput if needed
  if (!query && flowState.variables.userInput) {
    query = flowState.variables.userInput;
  }

  if (!query) {
    return {
      nextNodes: [],
      status: 'error',
      message: 'No query available for retrieval',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.form?.name || node.id,
        type: 'retrieval',
        role: 'developer',
      },
      execution: {
        startTime,
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        endTime: new Date().toISOString(),
        output: 'No query available for retrieval',
      },
    };
  }

  try {
    // Get knowledge base IDs and max results - add null checks
    const knowledgeIds = form.knowledgeIds || [];
    const maxResults = form.maxResults || 3;

    if (knowledgeIds.length === 0) {
      return {
        nextNodes: [],
        status: 'error',
        message: 'No knowledge bases specified',
        flowState,
        nodeInfo: {
          id: node.id,
          name: node.data?.label || node.id,
          type: 'retrieval',
          role: 'developer',
        },
        execution: {
          startTime,

          nodeId: node.id,
          nodeName: node.data?.label || node.id,
          endTime: new Date().toISOString(),
          output: 'No knowledge bases specified',
        },
      };
    }

    // Create execution status update
    const progressUpdate: ExecutionResult = {
      status: 'in_progress',
      nextNodes: [],
      message: `Retrieving information from ${knowledgeIds.length} knowledge base(s)...`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: new Date().toISOString(),
        output: `Retrieving information from ${knowledgeIds.length} knowledge base(s)...`,
      },
    };

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

    if (form.outputFormat === 'json') {
      formattedResults = JSON.stringify(allResults, null, 2);
    } else if (form.outputFormat === 'citations') {
      formattedResults = allResults.map((result, index) => `${result.text} [${index + 1}]`).join('\n\n') + '\n\nSources:\n' + allResults.map((result, index) => `[${index + 1}] ${result.source}`).join('\n');
    } else {
      formattedResults = allResults.map((result, index) => `[${index + 1}] ${result.text}\nSource: ${result.source}`).join('\n\n');
    }

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
        startTime: progressUpdate.execution?.startTime,
        endTime: new Date().toISOString(),
        output: formattedResults,
      },
    };
  } catch (error) {
    console.error('Error in retrieval node:', error);
    return {
      nextNodes: [],
      status: 'error',
      message: `Error retrieving information: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval',
        role: 'developer',
      },
      execution: {
        startTime,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        endTime: new Date().toISOString(),
        output: `Error retrieving information: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
    };
  }
}
