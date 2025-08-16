import { LinkedInNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '../@flow';

/**
 * Handler for executing LinkedIn nodes
 */
export async function executeLinkedInNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as LinkedInNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.postText || ''),
    ...getInputFromTemplate(form.articleTitle || ''),
    ...getInputFromTemplate(form.articleContent || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for LinkedIn operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'linkedin',
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
    // Validate required API credentials
    if (!form.accessToken) {
      throw new Error('LinkedIn access token is required');
    }

    console.log(`Executing LinkedIn node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_post':
        if (!form.postText) {
          throw new Error('Post text is required for creating posts');
        }
        const processedPost = processTemplate(form.postText, vars);
        result = await createLinkedInPost(form, processedPost);
        break;

      case 'get_profile':
        result = await getLinkedInProfile(form);
        break;

      case 'get_company_info':
        if (!form.companyId) {
          throw new Error('Company ID is required for getting company info');
        }
        result = await getLinkedInCompanyInfo(form, form.companyId);
        break;

      case 'create_article':
        if (!form.articleTitle || !form.articleContent) {
          throw new Error('Article title and content are required for creating articles');
        }
        const processedTitle = processTemplate(form.articleTitle, vars);
        const processedContent = processTemplate(form.articleContent, vars);
        result = await createLinkedInArticle(form, processedTitle, processedContent);
        break;

      case 'get_connections':
        result = await getLinkedInConnections(form);
        break;

      default:
        throw new Error(`Unsupported LinkedIn action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`LinkedIn node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'linkedin');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'linkedin';
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
        type: 'linkedin',
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
    console.error('LinkedIn execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown LinkedIn error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `LinkedIn operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'linkedin',
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

// Helper functions for LinkedIn API operations
async function createLinkedInPost(credentials: any, postText: string) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${credentials.personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': credentials.visibility || 'PUBLIC'
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LinkedIn API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getLinkedInProfile(form: any) {
  const response = await fetch('https://api.linkedin.com/v2/people/(id:' + (form.personId || '~') + ')', {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`);
  }

  return await response.json();
}

async function getLinkedInCompanyInfo(form: any, companyId: string) {
  const response = await fetch(`https://api.linkedin.com/v2/organizations/${companyId}`, {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`);
  }

  return await response.json();
}

async function createLinkedInArticle(form: any, title: string, content: string) {
  const response = await fetch('https://api.linkedin.com/v2/articles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${form.personId}`,
      title: title,
      content: {
        contentEntities: [{
          entity: 'urn:li:article',
          textDirection: 'USER_LOCALE',
          text: content
        }]
      },
      publishedAt: new Date().getTime()
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LinkedIn article creation error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getLinkedInConnections(form: any) {
  const response = await fetch('https://api.linkedin.com/v2/connections?q=viewer', {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`);
  }

  return await response.json();
}
