import { FlowNode, RetrievalNodeData, InputReference } from '../../../../../components/agent/types/flowTypes';
import { ExecutionResult, ExecutionStatusType, FlowExecutionContext } from '../../../../../types/flowExecutionTypes';
import { retrieveFromKnowledgeBase } from '../../../../../services/knowledgeService';
import { findNextNode } from '../flowExecutionService';
import { processInputReferences, getInputFromSource } from '../../../../../hooks/useInputReferences';

/**
 * Handler for executing Retrieval nodes
 */
export async function executeRetrievalNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<ExecutionResult> {
  const { flow, flowState } = context;
  const data = node.data as RetrievalNodeData;
  // Ensure form exists with a default empty object to prevent TypeScript errors
  const form = data.form || {};
  
  // Process any input references first using the shared hook
  processInputReferences(form.inputRefs, flowState.variables);
  
  // Get the query - prioritize lastUserInput if available
  let query = flowState.variables.lastUserInput || 
               getInputFromSource(form.querySource, flowState.variables, flowState.history);
  
  // Fallback to userInput if needed
  if (!query && flowState.variables.userInput) {
    query = flowState.variables.userInput;
  }
  
  if (!query) {
    return {
      status: 'error',
      message: 'No query available for retrieval',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.form?.name || node.id,
        type: 'retrieval'
      }
    };
  }
  
  try {
    // Get knowledge base IDs and max results - add null checks
    const knowledgeIds = form.knowledgeIds || [];
    const maxResults = form.maxResults || 3;
    
    if (knowledgeIds.length === 0) {
      return {
        status: 'error',
        message: 'No knowledge bases specified',
        flowState,
        nodeInfo: {
          id: node.id,
          name: node.data?.label || node.id,
          type: 'retrieval'
        }
      };
    }
    
    // Create execution status update
    const progressUpdate: ExecutionResult = {
      status: 'in_progress',
      message: `Retrieving information from ${knowledgeIds.length} knowledge base(s)...`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval'
      },
      executionStatus: {
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        status: 'running' as ExecutionStatusType,
        startTime: new Date().toISOString()
      }
    };
    
    // Retrieve information from knowledge bases
    const retrievalResults = await Promise.all(
      knowledgeIds.map(knowledgeId => 
        retrieveFromKnowledgeBase(knowledgeId, query!, { 
          maxResults, 
          threshold: form.threshold || 0.7 
        })
      )
    );
    
    // Flatten and limit results
    const allResults = retrievalResults
      .flat()
      .slice(0, maxResults);
    
    // Format the results based on the outputFormat setting
    let formattedResults: string;
    
    if (form.outputFormat === 'json') {
      // JSON format for structured data
      formattedResults = JSON.stringify(allResults, null, 2);
    } else if (form.outputFormat === 'citations') {
      // Format with citation markers
      formattedResults = allResults
        .map((result, index) => `${result.text} [${index + 1}]`)
        .join('\n\n') + '\n\nSources:\n' + 
        allResults.map((result, index) => `[${index + 1}] ${result.source}`).join('\n');
    } else {
      // Default text format
      formattedResults = allResults
        .map((result, index) => `[${index + 1}] ${result.text}\nSource: ${result.source}`)
        .join('\n\n');
    }
    
    // Get output variable name (with fallback)
    const outputVarName = form.outputVariable || 'retrievalResults';
    
    // Store the raw retrieval results in the specified variable
    flowState.variables[outputVarName] = allResults;
    
    // Also store in legacy variables for backward compatibility
    flowState.variables.retrievalResults = allResults;
    
    // Store formatted results for generate node to use
    flowState.variables.retrievalContext = formattedResults;
    
    // Store structured outputs if defined - add null check
    if (form.outputs && form.outputs.length > 0) {
      form.outputs.forEach(output => {
        if (output.name) {
          // Store under both node-qualified and direct names for flexibility
          const qualifiedName = `${node.id}.${output.name}`;
          
          // Store appropriate output based on output name
          if (output.name === 'results') {
            flowState.variables[qualifiedName] = allResults;
          } else if (output.name === 'formattedResults') {
            flowState.variables[qualifiedName] = formattedResults;
          }
        }
      });
    }
    
    // Find the next node
    const nextNodeId = findNextNode(flow, node.id);
    
    // Update execution status to completed
    const executionStatus = {
      nodeId: node.id,
      nodeName: node.data?.form?.name || node.id,
      status: 'completed' as ExecutionStatusType,
      startTime: progressUpdate.executionStatus?.startTime,
      endTime: new Date().toISOString()
    };
    
    // Add to history
    flowState.history.push({
      nodeId: node.id,
      nodeType: 'retrieval',
      timestamp: new Date().toISOString(),
      input: query,
      output: formattedResults,
      status: 'success'
    });
    
    if (!nextNodeId) {
      return {
        status: 'completed',
        output: formattedResults,
        flowState,
        nodeInfo: {
          id: node.id,
          name: node.data?.label || node.id,
          type: 'retrieval'
        },
        executionStatus
      };
    }
    
    return {
      status: 'in_progress',
      output: formattedResults,
      nextNodeId,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval'
      },
      executionStatus
    };
  } catch (error) {
    console.error('Error in retrieval node:', error);
    return {
      status: 'error',
      message: `Error retrieving information: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'retrieval'
      },
      executionStatus: {
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        status: 'error' as ExecutionStatusType,
        endTime: new Date().toISOString()
      }
    };
  }
}
