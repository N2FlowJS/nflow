import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { FacebookNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';

/**
 * Handler for executing Facebook nodes
 */
export async function executeFacebookNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as FacebookNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.comment || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Facebook operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'facebook',
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
    if (!form.accessToken) {
      throw new Error('Facebook access token is required');
    }

    console.log(`Executing Facebook node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_post':
        if (!form.message) {
          throw new Error('Message is required for creating posts');
        }

        const processedMessage = processTemplate(form.message, vars);
        
        result = await createFacebookPost(form.accessToken, form.pageId, {
          message: processedMessage,
          link: form.link,
          scheduled_publish_time: form.scheduled && form.scheduledTime ? 
            Math.floor(new Date(form.scheduledTime).getTime() / 1000) : undefined,
          published: !form.scheduled,
        });
        break;

      case 'upload_photo':
        if (!form.message || !form.photoUrl) {
          throw new Error('Message and photo URL are required for uploading photos');
        }
        
        const processedPhotoMessage = processTemplate(form.message, vars);
        
        result = await uploadFacebookPhoto(form.accessToken, form.pageId, {
          message: processedPhotoMessage,
          url: form.photoUrl,
          scheduled_publish_time: form.scheduled && form.scheduledTime ? 
            Math.floor(new Date(form.scheduledTime).getTime() / 1000) : undefined,
          published: !form.scheduled,
        });
        break;

      case 'get_page_info':
        result = await getFacebookPageInfo(form.accessToken, form.pageId);
        break;

      case 'get_posts':
        result = await getFacebookPosts(form.accessToken, form.pageId);
        break;

      case 'get_page_insights':
        result = await getFacebookPageInsights(form.accessToken, form.pageId);
        break;

      case 'create_comment':
        if (!form.postId || !form.comment) {
          throw new Error('Post ID and comment are required for adding comments');
        }
        
        const processedComment = processTemplate(form.comment, vars);
        result = await createFacebookComment(form.accessToken, form.postId, processedComment);
        break;

      default:
        throw new Error(`Unsupported Facebook action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Facebook node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'facebook');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'facebook';
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
        type: 'facebook',
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
    console.error('Facebook execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Facebook error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Facebook operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'facebook',
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

// Helper functions for Facebook Graph API operations
async function createFacebookPost(accessToken: string, pageId: string | undefined, postData: any) {
  const endpoint = pageId ? `${pageId}/feed` : 'me/feed';
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: postData.message,
      link: postData.link,
      access_token: accessToken,
      ...(postData.scheduled_publish_time && {
        scheduled_publish_time: postData.scheduled_publish_time,
        published: false,
      }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function uploadFacebookPhoto(accessToken: string, pageId: string | undefined, photoData: any) {
  const endpoint = pageId ? `${pageId}/photos` : 'me/photos';
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: photoData.message,
      url: photoData.url,
      access_token: accessToken,
      ...(photoData.scheduled_publish_time && {
        scheduled_publish_time: photoData.scheduled_publish_time,
        published: false,
      }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getFacebookPageInfo(accessToken: string, pageId: string | undefined) {
  const endpoint = pageId || 'me';
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${endpoint}?fields=id,name,about,category,followers_count,fan_count&access_token=${accessToken}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getFacebookPosts(accessToken: string, pageId: string | undefined) {
  const endpoint = pageId ? `${pageId}/posts` : 'me/posts';
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${endpoint}?fields=id,message,created_time,likes.summary(true),comments.summary(true)&limit=25&access_token=${accessToken}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getFacebookPageInsights(accessToken: string, pageId: string | undefined) {
  if (!pageId) {
    throw new Error('Page ID is required for insights');
  }
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_reach,page_fans&period=day&access_token=${accessToken}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function createFacebookComment(accessToken: string, postId: string, comment: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: comment,
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Facebook API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}
