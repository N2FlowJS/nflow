import { WikipediaSearchNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing Wikipedia Search nodes
 */
export async function executeWikipediaSearchNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WikipediaSearchNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the query template
  const inputs: string[] = getInputFromTemplate(form.query || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Wikipedia search',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'wikipediasearch',
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
    
    console.log(`Executing Wikipedia search: ${processedQuery}`);

    const language = form.language || 'en';
    const maxResults = Math.min(form.maxResults || 5, 20);

    // Search Wikipedia
    const searchUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(processedQuery)}`;
    
    let results: any[] = [];

    // First try direct page lookup
    try {
      const directResponse = await fetch(searchUrl);
      if (directResponse.ok) {
        const pageData = await directResponse.json();
        if (pageData.type === 'standard') {
          results.push({
            title: pageData.title,
            description: pageData.extract,
            url: pageData.content_urls?.desktop?.page || `https://${language}.wikipedia.org/wiki/${encodeURIComponent(pageData.title)}`,
            score: 1.0
          });
        }
      }
    } catch (error) {
      console.log('Direct page lookup failed, trying search API');
    }

    // If no direct match, use search API
    if (results.length === 0) {
      const apiUrl = `https://${language}.wikipedia.org/w/api.php`;
      const searchParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: processedQuery,
        srlimit: maxResults.toString(),
        origin: '*'
      });

      const searchResponse = await fetch(`${apiUrl}?${searchParams}`);
      
      if (!searchResponse.ok) {
        throw new Error(`Wikipedia API error (${searchResponse.status})`);
      }

      const searchData = await searchResponse.json();
      const searchResults = searchData.query?.search || [];

      // Get page summaries for search results
      for (const result of searchResults.slice(0, maxResults)) {
        try {
          const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`;
          const summaryResponse = await fetch(summaryUrl);
          
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            results.push({
              title: summaryData.title,
              description: form.summaryOnly ? summaryData.extract : summaryData.extract_html || summaryData.extract,
              url: summaryData.content_urls?.desktop?.page || `https://${language}.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
              score: 1.0
            });
          }
        } catch (error) {
          console.log(`Failed to get summary for ${result.title}`);
        }
      }
    }

    // Format results
    const resultText = results.length > 0 
      ? results.map((result: any, index: number) => 
          `[${index + 1}] ${result.title}\n${result.description}\nURL: ${result.url}\n`
        ).join('\n')
      : 'No Wikipedia articles found.';
    
    console.log(`Wikipedia search completed: ${results.length} articles found`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'wikipediasearch');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'wikipediasearch';
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
        type: 'wikipediasearch',
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
    console.error('Wikipedia search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Wikipedia search error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Wikipedia search failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'wikipediasearch',
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
