import type {
  ExecutionResult,
  FlowExecutionContext,
  FlowNode,
  FlowStateDispatcher,
} from '@n2flowjs/flow';
import { findNextNodes, isNodeReady } from '@n2flowjs/flow';
import { GoogleSearchNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Handler for executing Google Search nodes
 */
export async function executeGoogleSearchNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as GoogleSearchNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the query template
  const inputs: string[] = getInputFromTemplate(form.query || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Google search',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'googlesearch',
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
    // Validate required fields
    if (!form.query || form.query.trim() === '') {
      throw new Error('No search query specified');
    }

    // Process the query template with variables
    const processedQuery = processTemplate(form.query, vars);
    
    console.log(`Executing Google search: ${processedQuery}`);

    // Get API configuration
    let apiKey: string;
    let searchEngineId: string;

    if (form.useSystemConfig) {
      apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
      searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    } else {
      apiKey = form.apiKey || '';
      searchEngineId = form.searchEngineId || '';
    }

    if (!apiKey || !searchEngineId) {
      throw new Error('Google Search API key and Search Engine ID are required');
    }

    // Build search URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', apiKey);
    searchUrl.searchParams.append('cx', searchEngineId);
    searchUrl.searchParams.append('q', processedQuery);
    searchUrl.searchParams.append('num', Math.min(form.maxResults || 10, 10).toString());
    
    if (form.safeSearch) {
      searchUrl.searchParams.append('safe', form.safeSearch);
    }
    if (form.language) {
      searchUrl.searchParams.append('lr', `lang_${form.language}`);
    }
    if (form.country) {
      searchUrl.searchParams.append('gl', form.country);
    }

    // Execute search
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Search API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Format results
    const results = data.items || [];
    const formattedResults = results.map((item: any, index: number) => ({
      position: index + 1,
      title: item.title || '',
      description: item.snippet || '',
      url: item.link || '',
      displayLink: item.displayLink || ''
    }));

    const resultText = formattedResults.length > 0 
      ? formattedResults.map((result: any) => 
          `[${result.position}] ${result.title}\n${result.description}\nURL: ${result.url}\n`
        ).join('\n')
      : 'No search results found.';
    
    console.log(`Google search completed: ${formattedResults.length} results found`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'googlesearch');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'googlesearch';
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
        type: 'googlesearch',
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
    console.error('Google search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Google search error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Google search failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'googlesearch',
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
