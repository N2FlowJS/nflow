import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { YouTubeNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../../../../packages/@template-processor/templateProcessor';
import { isNodeReady } from '../../../../packages/@flow/is-node-ready';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';

/**
 * Handler for executing YouTube nodes
 */
export async function executeYouTubeNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as YouTubeNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.title || ''),
    ...getInputFromTemplate(form.videoDescription || ''),
    ...getInputFromTemplate(form.playlistTitle || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for YouTube operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'youtube',
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
    if (!form.apiKey) {
      throw new Error('YouTube API key is required');
    }

    console.log(`Executing YouTube node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'upload_video':
        if (!form.videoFile || !form.title) {
          throw new Error('Video file and title are required for uploading videos');
        }
        const processedTitle = processTemplate(form.title, vars);
        const processedDescription = form.videoDescription ? processTemplate(form.videoDescription, vars) : '';
        result = await uploadYouTubeVideo(form, processedTitle, processedDescription);
        break;

      case 'get_videos':
        result = await getYouTubeVideos(form);
        break;

      case 'get_channel_info':
        if (!form.channelId) {
          throw new Error('Channel ID is required for getting channel info');
        }
        result = await getYouTubeChannelInfo(form, form.channelId);
        break;

      case 'create_playlist':
        if (!form.playlistTitle) {
          throw new Error('Playlist title is required for creating playlists');
        }
        const processedPlaylistTitle = processTemplate(form.playlistTitle, vars);
        result = await createYouTubePlaylist(form, processedPlaylistTitle);
        break;

      case 'get_comments':
        if (!form.videoId) {
          throw new Error('Video ID is required for getting comments');
        }
        result = await getYouTubeComments(form, form.videoId);
        break;

      case 'get_analytics':
        result = await getYouTubeAnalytics(form);
        break;

      default:
        throw new Error(`Unsupported YouTube action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`YouTube node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'youtube');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'youtube';
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
        type: 'youtube',
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
    console.error('YouTube execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown YouTube error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `YouTube operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'youtube',
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

// Helper functions for YouTube API operations
async function uploadYouTubeVideo(credentials: any, title: string, description: string) {
  // Note: Video upload requires multipart upload and is complex
  // This is a simplified version - real implementation would need file handling
  throw new Error('Video upload requires file handling and multipart upload - use YouTube Studio or dedicated upload endpoint');
}

async function getYouTubeVideos(form: any) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('key', form.apiKey);
  url.searchParams.append('channelId', form.channelId);
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('order', 'date');
  url.searchParams.append('maxResults', '25');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`YouTube API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getYouTubeChannelInfo(form: any, channelId: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.append('key', form.apiKey);
  url.searchParams.append('id', channelId);
  url.searchParams.append('part', 'snippet,statistics');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`YouTube API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function createYouTubePlaylist(form: any, title: string) {
  const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`, // Requires OAuth
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        title: title,
        description: form.playlistDescription || 'Created via automation'
      },
      status: {
        privacyStatus: 'private'
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`YouTube API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getYouTubeComments(form: any, videoId: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
  url.searchParams.append('key', form.apiKey);
  url.searchParams.append('videoId', videoId);
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('maxResults', '100');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`YouTube API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getYouTubeAnalytics(form: any) {
  // YouTube Analytics API requires separate setup and OAuth
  const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
  url.searchParams.append('ids', `channel==${form.channelId}`);
  url.searchParams.append('startDate', '2023-01-01');
  url.searchParams.append('endDate', '2023-12-31');
  url.searchParams.append('metrics', 'views,likes,comments');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`, // Requires OAuth
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`YouTube Analytics API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}
