import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { DuckGoSearchNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '@n2flowjs/flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';

/**
 * Handler for executing DuckDuckGo Search nodes
 */
export async function executeDuckGoSearchNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as DuckGoSearchNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = getInputFromTemplate(form.query || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for DuckDuckGo search',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'duckgosearch',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    const processedQuery = processTemplate(form.query || '', vars);
    
    if (!processedQuery.trim()) {
      throw new Error('Search query is empty after template processing');
    }

    console.log(`Executing DuckDuckGo Search node: ${node.id} with query: ${processedQuery}`);

    const searchResults = await performDuckGoSearch(form, processedQuery);
    
    const resultText = JSON.stringify(searchResults, null, 2);
    
    console.log(`DuckDuckGo Search node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'duckgosearch');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'duckgosearch';
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
        type: 'duckgosearch',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('DuckDuckGo Search execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown DuckDuckGo Search error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `DuckDuckGo Search failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'duckgosearch',
        role: 'developer',
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

// Helper function for DuckDuckGo Search
async function performDuckGoSearch(form: any, query: string) {
  const maxResults = Math.min(form.maxResults || 10, 30); // DuckDuckGo Instant Answer API limit
  const searchType = form.searchType || 'web';
  
  // DuckDuckGo Instant Answer API - free and doesn't require API key
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    pretty: '1',
    no_html: form.noHTML ? '1' : '0',
    skip_disambig: '1',
    no_redirect: form.noRedirect ? '1' : '0',
    safe_search: getSafeSearchValue(form.safeSearch || 'moderate'),
  });

  const response = await fetch(`https://api.duckduckgo.com/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'NFlow-Search-Bot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  
  // Format results - DuckDuckGo API returns different structure
  let results = [];
  
  // Abstract (main result)
  if (data.Abstract) {
    results.push({
      title: data.Heading || 'DuckDuckGo Result',
      description: data.Abstract,
      url: data.AbstractURL,
      source: data.AbstractSource,
      type: 'abstract',
    });
  }

  // Related topics
  if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
    const relatedResults = data.RelatedTopics
      .filter((topic: any) => topic.Text && topic.FirstURL)
      .slice(0, maxResults - results.length)
      .map((topic: any) => ({
        title: topic.Text.split(' - ')[0] || 'Related Topic',
        description: topic.Text,
        url: topic.FirstURL,
        source: 'DuckDuckGo',
        type: 'related',
      }));
    
    results = results.concat(relatedResults);
  }

  // Answer (if available)
  if (data.Answer) {
    results.unshift({
      title: 'Direct Answer',
      description: data.Answer,
      url: data.AnswerURL || '',
      source: 'DuckDuckGo Instant Answer',
      type: 'answer',
    });
  }

  // Definition (if available)
  if (data.Definition) {
    results.unshift({
      title: 'Definition',
      description: data.Definition,
      url: data.DefinitionURL || '',
      source: data.DefinitionSource || 'DuckDuckGo',
      type: 'definition',
    });
  }

  // Limit results to maxResults
  results = results.slice(0, maxResults);

  return {
    query: query,
    searchType: searchType,
    totalResults: results.length,
    results: results,
    timestamp: new Date().toISOString(),
    privacy_note: 'DuckDuckGo does not track users or store personal information',
  };
}

function getSafeSearchValue(safeSearch: string): string {
  switch (safeSearch) {
    case 'strict':
      return '1';
    case 'off':
      return '-1';
    case 'moderate':
    default:
      return '0';
  }
}
