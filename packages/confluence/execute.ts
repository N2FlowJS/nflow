import { FlowNode } from '../../models/flowTypes';
import { ConfluenceNodeData } from './types';
import { findNextNodes } from '../@flow';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '../@flow';
import { FlowStateDispatcher } from '../@flow';
import { ExecutionResult, FlowExecutionContext } from '../@flow';

/**
 * Handler for executing Confluence nodes
 */
export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ConfluenceNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.title || ''),
    ...getInputFromTemplate(form.content || ''),
    ...getInputFromTemplate(form.comment || ''),
    ...getInputFromTemplate(form.searchQuery || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Confluence operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'confluence',
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
    if (!form.serverUrl || !form.username || !form.apiToken) {
      throw new Error('Confluence server URL, username, and API token are required');
    }

    console.log(`Executing Confluence node: ${node.id} with action: ${form.action}`);

    const auth = Buffer.from(`${form.username}:${form.apiToken}`).toString('base64');
    let result: any;

    switch (form.action) {
      case 'create_page':
        if (!form.spaceKey || !form.title || !form.content) {
          throw new Error('Space key, title, and content are required for creating pages');
        }

        const processedTitle = processTemplate(form.title, vars);
        const processedContent = processTemplate(form.content, vars);
        
        result = await createConfluencePage(form.serverUrl, auth, {
          spaceKey: form.spaceKey,
          title: processedTitle,
          content: processedContent,
          parentPageId: form.parentPageId,
        });
        break;

      case 'update_page':
        if (!form.pageId || !form.title || !form.content) {
          throw new Error('Page ID, title, and content are required for updating pages');
        }
        
        const processedUpdateTitle = processTemplate(form.title, vars);
        const processedUpdateContent = processTemplate(form.content, vars);
        
        result = await updateConfluencePage(form.serverUrl, auth, form.pageId, {
          title: processedUpdateTitle,
          content: processedUpdateContent,
        });
        break;

      case 'get_page':
        if (!form.pageId) {
          throw new Error('Page ID is required for getting pages');
        }
        
        result = await getConfluencePage(form.serverUrl, auth, form.pageId);
        break;

      case 'search_pages':
        if (!form.searchQuery) {
          throw new Error('Search query is required for searching pages');
        }
        
        const processedQuery = processTemplate(form.searchQuery, vars);
        result = await searchConfluencePages(form.serverUrl, auth, processedQuery, form.spaceKey);
        break;

      case 'add_comment':
        if (!form.pageId || !form.comment) {
          throw new Error('Page ID and comment are required for adding comments');
        }
        
        const processedComment = processTemplate(form.comment, vars);
        result = await addConfluenceComment(form.serverUrl, auth, form.pageId, processedComment);
        break;

      case 'get_spaces':
        result = await getConfluenceSpaces(form.serverUrl, auth);
        break;

      default:
        throw new Error(`Unsupported Confluence action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Confluence node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'confluence');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'confluence';
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
        type: 'confluence',
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
    console.error('Confluence execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Confluence error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Confluence operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'confluence',
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

// Helper functions for Confluence API operations
async function createConfluencePage(serverUrl: string, auth: string, pageData: any) {
  const response = await fetch(`${serverUrl}/wiki/rest/api/content`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'page',
      title: pageData.title,
      space: {
        key: pageData.spaceKey,
      },
      body: {
        storage: {
          value: pageData.content,
          representation: 'storage',
        },
      },
      ...(pageData.parentPageId && {
        ancestors: [{ id: pageData.parentPageId }],
      }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Confluence API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function updateConfluencePage(serverUrl: string, auth: string, pageId: string, updateData: any) {
  // First get the current page to get the version
  const currentPage = await getConfluencePage(serverUrl, auth, pageId);
  
  const response = await fetch(`${serverUrl}/wiki/rest/api/content/${pageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: {
        number: currentPage.version.number + 1,
      },
      title: updateData.title,
      type: 'page',
      body: {
        storage: {
          value: updateData.content,
          representation: 'storage',
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Confluence API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getConfluencePage(serverUrl: string, auth: string, pageId: string) {
  const response = await fetch(`${serverUrl}/wiki/rest/api/content/${pageId}?expand=body.storage,version`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Confluence API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

// spaceKey kept for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchConfluencePages(serverUrl: string, auth: string, query: string, _spaceKey?: string) {
  const searchParams = new URLSearchParams({
    cql: query,
    limit: '50',
  });

  const response = await fetch(`${serverUrl}/wiki/rest/api/content/search?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Confluence API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function addConfluenceComment(serverUrl: string, auth: string, pageId: string, comment: string) {
  const response = await fetch(`${serverUrl}/wiki/rest/api/content`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'comment',
      container: {
        id: pageId,
      },
      body: {
        storage: {
          value: comment,
          representation: 'storage',
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Confluence API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getConfluenceSpaces(serverUrl: string, auth: string) {
  const response = await fetch(`${serverUrl}/wiki/rest/api/space`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Confluence API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}
