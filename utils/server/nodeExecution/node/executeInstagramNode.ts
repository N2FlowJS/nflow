import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { InstagramNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Instagram nodes
 */
export async function executeInstagramNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as InstagramNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.caption || ''),
    ...getInputFromTemplate(form.mediaUrl || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Instagram operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'instagram',
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
      throw new Error('Instagram access token is required');
    }

    console.log(`Executing Instagram node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_post':
        if (!form.caption && !form.mediaUrl) {
          throw new Error('Caption or media URL is required for creating posts');
        }
        const processedCaption = form.caption ? processTemplate(form.caption, vars) : '';
        const processedMediaUrl = form.mediaUrl ? processTemplate(form.mediaUrl, vars) : '';
        result = await createInstagramPost(form, processedCaption, processedMediaUrl);
        break;

      case 'get_posts':
        result = await getInstagramPosts(form);
        break;

      case 'get_user_info':
        result = await getInstagramUserInfo(form);
        break;

      case 'get_media':
        result = await getInstagramMedia(form);
        break;

      case 'create_story':
        if (!form.storyMediaUrl) {
          throw new Error('Story media URL is required for creating stories');
        }
        result = await createInstagramStory(form);
        break;

      case 'get_insights':
        result = await getInstagramInsights(form);
        break;

      default:
        throw new Error(`Unsupported Instagram action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Instagram node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'instagram');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'instagram';
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
        type: 'instagram',
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
    console.error('Instagram execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Instagram error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Instagram operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'instagram',
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

// Helper functions for Instagram API operations
async function createInstagramPost(credentials: any, caption: string, mediaUrl: string) {
  // Step 1: Upload media
  const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${credentials.userId}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: mediaUrl,
      caption: caption,
      access_token: credentials.accessToken,
    }),
  });

  if (!mediaResponse.ok) {
    const errorData = await mediaResponse.text();
    throw new Error(`Instagram media upload error (${mediaResponse.status}): ${errorData}`);
  }

  const mediaData = await mediaResponse.json();
  const mediaId = mediaData.id;

  // Step 2: Publish media
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${credentials.userId}/media_publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: mediaId,
      access_token: credentials.accessToken,
    }),
  });

  if (!publishResponse.ok) {
    const errorData = await publishResponse.text();
    throw new Error(`Instagram publish error (${publishResponse.status}): ${errorData}`);
  }

  return await publishResponse.json();
}

async function getInstagramPosts(form: any) {
  const url = new URL(`https://graph.facebook.com/v18.0/${form.userId}/media`);
  url.searchParams.append('fields', 'id,caption,media_type,media_url,timestamp,permalink');
  url.searchParams.append('access_token', form.accessToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.status}`);
  }

  return await response.json();
}

async function getInstagramUserInfo(form: any) {
  const url = new URL(`https://graph.facebook.com/v18.0/${form.userId || 'me'}`);
  url.searchParams.append('fields', 'id,username,account_type,media_count,followers_count');
  url.searchParams.append('access_token', form.accessToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.status}`);
  }

  return await response.json();
}

async function getInstagramMedia(form: any) {
  const url = new URL(`https://graph.facebook.com/v18.0/${form.userId}/media`);
  url.searchParams.append('fields', 'id,media_type,media_url,thumbnail_url,timestamp');
  url.searchParams.append('access_token', form.accessToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.status}`);
  }

  return await response.json();
}

async function createInstagramStory(form: any) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${form.userId}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: form.storyMediaUrl,
      media_type: 'STORIES',
      access_token: form.accessToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Instagram story creation error (${response.status}): ${errorData}`);
  }

  const mediaData = await response.json();

  // Publish the story
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${form.userId}/media_publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: mediaData.id,
      access_token: form.accessToken,
    }),
  });

  if (!publishResponse.ok) {
    throw new Error(`Instagram story publish error: ${publishResponse.status}`);
  }

  return await publishResponse.json();
}

async function getInstagramInsights(form: any) {
  const url = new URL(`https://graph.facebook.com/v18.0/${form.userId}/insights`);
  url.searchParams.append('metric', 'impressions,reach,profile_views');
  url.searchParams.append('period', 'day');
  url.searchParams.append('access_token', form.accessToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Instagram insights error: ${response.status}`);
  }

  return await response.json();
}
