import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { TikTokNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing TikTok nodes
 */
export async function executeTikTokNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as TikTokNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.caption || ''),
    ...getInputFromTemplate(form.hashtag || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for TikTok operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'tiktok',
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
      throw new Error('TikTok access token is required');
    }

    console.log(`Executing TikTok node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'upload_video':
        if (!form.videoFile) {
          throw new Error('Video file is required for uploading videos');
        }
        const processedCaption = form.caption ? processTemplate(form.caption, vars) : '';
        result = await uploadTikTokVideo(form, processedCaption);
        break;

      case 'get_user_info':
        if (!form.userId) {
          throw new Error('User ID is required for getting user info');
        }
        result = await getTikTokUserInfo(form, form.userId);
        break;

      case 'get_videos':
        result = await getTikTokVideos(form);
        break;

      case 'get_hashtag_videos':
        if (!form.hashtag) {
          throw new Error('Hashtag is required for getting hashtag videos');
        }
        const processedHashtag = processTemplate(form.hashtag, vars);
        result = await getTikTokHashtagVideos(form, processedHashtag);
        break;

      default:
        throw new Error(`Unsupported TikTok action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`TikTok node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'tiktok');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'tiktok';
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
        type: 'tiktok',
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
    console.error('TikTok execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown TikTok error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `TikTok operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'tiktok',
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

// Helper functions for TikTok API operations
async function uploadTikTokVideo(credentials: any, caption: string) {
  // Mock implementation - replace with actual TikTok for Developers API
  return {
    video_id: 'mock_video_id',
    caption: caption,
    hashtags: credentials.hashtags || [],
    privacy_status: credentials.privacy || 'public',
    created_time: Math.floor(Date.now() / 1000),
    share_url: 'https://tiktok.com/@user/video/mock_video_id'
  };
}

async function getTikTokUserInfo(form: any, userId: string) {
  // Mock implementation
  return {
    user_id: userId,
    username: 'sample_user',
    display_name: 'Sample User',
    bio_description: 'Sample bio',
    follower_count: 1000,
    following_count: 500,
    likes_count: 10000,
    video_count: 50
  };
}

async function getTikTokVideos(form: any) {
  // Mock implementation
  return {
    videos: [
      {
        video_id: 'mock_video_1',
        title: 'Sample Video',
        view_count: 1000,
        like_count: 100,
        comment_count: 50,
        share_count: 25,
        create_time: Math.floor(Date.now() / 1000)
      }
    ],
    cursor: 'next_page_token',
    has_more: false
  };
}

async function getTikTokHashtagVideos(form: any, hashtag: string) {
  // Mock implementation
  return {
    videos: [
      {
        video_id: 'mock_hashtag_video_1',
        title: `Video with ${hashtag}`,
        view_count: 5000,
        like_count: 500,
        hashtag: hashtag,
        create_time: Math.floor(Date.now() / 1000)
      }
    ],
    cursor: 'next_page_token',
    has_more: true
  };
}
