import type { FlowNode } from "../../models/flowTypes";
import type { BingSearchNodeData } from "./types";
import { ExecutionResult, findNextNodes, FlowExecutionContext, FlowStateDispatcher, isNodeReady } from "../@flow";
import { getInputFromTemplate, processTemplate } from "@n2flowjs/template/template";


/**
 * Handler for executing Bing Search nodes
 */
export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as BingSearchNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = getInputFromTemplate(form.query || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Bing search',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'bingsearch',
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

    console.log(`Executing Bing Search node: ${node.id} with query: ${processedQuery}`);

    const searchResults = await performBingSearch(form, processedQuery);
    
    const resultText = JSON.stringify(searchResults, null, 2);
    
    console.log(`Bing Search node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'bingsearch');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'bingsearch';
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
        type: 'bingsearch',
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
    console.error('Bing Search execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Bing Search error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Bing Search failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'bingsearch',
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

// Helper function for Bing Search API
async function performBingSearch(form: any, query: string) {
  const apiKey = form.apiKey || process.env.BING_SEARCH_API_KEY;
  
  if (!apiKey) {
    throw new Error('Bing Search API key is required. Set BING_SEARCH_API_KEY environment variable or provide in form.');
  }

  const searchType = form.searchType || 'web';
  const maxResults = Math.min(form.maxResults || 10, 50); // Bing API limit
  
  let endpoint = 'https://api.bing.microsoft.com/v7.0/search';
  
  // Different endpoints for different search types
  switch (searchType) {
    case 'images':
      endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';
      break;
    case 'news':
      endpoint = 'https://api.bing.microsoft.com/v7.0/news/search';
      break;
    case 'videos':
      endpoint = 'https://api.bing.microsoft.com/v7.0/videos/search';
      break;
    default:
      endpoint = 'https://api.bing.microsoft.com/v7.0/search';
  }

  const params = new URLSearchParams({
    q: query,
    count: maxResults.toString(),
    safeSearch: form.safeSearch || 'moderate',
    setLang: form.language || 'en',
    cc: form.country || 'us',
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Bing Search API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  
  // Format results based on search type
  let results = [];
  
  switch (searchType) {
    case 'web':
      results = (data.webPages?.value || []).map((item: any) => ({
        title: item.name,
        description: item.snippet,
        url: item.url,
        displayUrl: item.displayUrl,
        dateLastCrawled: item.dateLastCrawled,
      }));
      break;
    case 'images':
      results = (data.value || []).map((item: any) => ({
        title: item.name,
        description: item.name,
        url: item.contentUrl,
        thumbnailUrl: item.thumbnailUrl,
        width: item.width,
        height: item.height,
      }));
      break;
    case 'news':
      results = (data.value || []).map((item: any) => ({
        title: item.name,
        description: item.description,
        url: item.url,
        datePublished: item.datePublished,
        provider: item.provider?.[0]?.name,
      }));
      break;
    case 'videos':
      results = (data.value || []).map((item: any) => ({
        title: item.name,
        description: item.description,
        url: item.contentUrl,
        thumbnailUrl: item.thumbnailUrl,
        duration: item.duration,
        viewCount: item.viewCount,
      }));
      break;
  }

  return {
    query: query,
    searchType: searchType,
    totalEstimatedMatches: data.webPages?.totalEstimatedMatches || data.totalEstimatedMatches || 0,
    results: results,
    timestamp: new Date().toISOString(),
  };
}
