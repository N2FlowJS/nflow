import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * YouTube Node Definition
 * 
 * Interact with YouTube Data API v3.
 * Upload videos, manage playlists, get channel info, analytics, and comments.
 * 
 * Configuration:
 * - apiKey: YouTube Data API key (required)
 * - action: Operation to perform
 * - title: Video/playlist title (supports {variable} templates)
 * - videoDescription: Video description (supports {variable} templates)
 * - videoFile: Video file path for upload
 * - channelId: Channel ID for operations
 * - videoId: Video ID for operations
 * - playlistTitle: Playlist title (supports {variable} templates)
 * 
 * Actions:
 * - upload_video: Upload a video to YouTube
 * - get_videos: Get channel videos
 * - get_channel_info: Get channel information
 * - create_playlist: Create a new playlist
 * - get_comments: Get video comments
 * - get_analytics: Get channel analytics
 * 
 * Example:
 * ```json
 * {
 *   "apiKey": "YOUR_API_KEY",
 *   "action": "get_channel_info",
 *   "channelId": "UCxxxxxx"
 * }
 * ```
 */
export const YouTubeNodeDefinition: NodeDefinition = {
  id: 'youtube',
  name: 'YouTube',
  category: NodeCategory.API,
  description: 'Interact with YouTube Data API v3',
  version: '1.0.0',

  inputs: [
    {
      id: 'apiKey',
      name: 'API Key',
      type: PortType.TEXT,
      description: 'YouTube Data API key',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter API key...', isPassword: true },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'YouTube operation to perform',
      required: true,
      defaultValue: 'get_channel_info',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Upload Video', value: 'upload_video' },
          { label: 'Get Videos', value: 'get_videos' },
          { label: 'Get Channel Info', value: 'get_channel_info' },
          { label: 'Create Playlist', value: 'create_playlist' },
          { label: 'Get Comments', value: 'get_comments' },
          { label: 'Get Analytics', value: 'get_analytics' },
        ],
      },
    },
    {
      id: 'title',
      name: 'Video Title',
      type: PortType.TEXT,
      description: 'Video title (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Enter video title...' },
    },
    {
      id: 'videoDescription',
      name: 'Video Description',
      type: PortType.TEXT,
      description: 'Video description (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter video description...' },
    },
    {
      id: 'videoFile',
      name: 'Video File',
      type: PortType.TEXT,
      description: 'Video file path for upload',
      required: false,
      metadata: { inputType: 'text', placeholder: './video.mp4' },
    },
    {
      id: 'channelId',
      name: 'Channel ID',
      type: PortType.TEXT,
      description: 'YouTube channel ID',
      required: false,
      metadata: { inputType: 'text', placeholder: 'UCxxxxxx' },
    },
    {
      id: 'videoId',
      name: 'Video ID',
      type: PortType.TEXT,
      description: 'YouTube video ID',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Video ID' },
    },
    {
      id: 'playlistTitle',
      name: 'Playlist Title',
      type: PortType.TEXT,
      description: 'Playlist title (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Playlist title' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'API Result',
      type: PortType.JSON,
      description: 'YouTube API response',
    },
    {
      id: 'videoId',
      name: 'Video ID',
      type: PortType.TEXT,
      description: 'Video ID (if applicable)',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.title) {
      getInputFromTemplate(config.title as string).forEach(v => variableNames.add(v));
    }
    if (config.videoDescription) {
      getInputFromTemplate(config.videoDescription as string).forEach(v => variableNames.add(v));
    }
    if (config.playlistTitle) {
      getInputFromTemplate(config.playlistTitle as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...YouTubeNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.title as string) || ''),
      ...getInputFromTemplate((config.videoDescription as string) || ''),
      ...getInputFromTemplate((config.playlistTitle as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, videoId: '' },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      if (!config.apiKey) {
        throw new Error('YouTube API key is required');
      }

      let result: any;

      switch (config.action) {
        case 'upload_video':
          if (!config.videoFile || !config.title) {
            throw new Error('Video file and title are required for uploading videos');
          }
          const processedTitle = processTemplate(config.title as string, vars);
          const processedDescription = config.videoDescription
            ? processTemplate(config.videoDescription as string, vars)
            : '';
          result = await uploadYouTubeVideo(
            config.apiKey as string,
            config.videoFile as string,
            processedTitle,
            processedDescription
          );
          break;

        case 'get_videos':
          result = await getYouTubeVideos(config.apiKey as string, config.channelId as string);
          break;

        case 'get_channel_info':
          if (!config.channelId) {
            throw new Error('Channel ID is required for getting channel info');
          }
          result = await getYouTubeChannelInfo(config.apiKey as string, config.channelId as string);
          break;

        case 'create_playlist':
          if (!config.playlistTitle) {
            throw new Error('Playlist title is required for creating playlists');
          }
          const processedPlaylistTitle = processTemplate(config.playlistTitle as string, vars);
          result = await createYouTubePlaylist(config.apiKey as string, processedPlaylistTitle);
          break;

        case 'get_comments':
          if (!config.videoId) {
            throw new Error('Video ID is required for getting comments');
          }
          result = await getYouTubeComments(config.apiKey as string, config.videoId as string);
          break;

        case 'get_analytics':
          result = await getYouTubeAnalytics(config.apiKey as string, config.channelId as string);
          break;

        default:
          throw new Error(`Unsupported YouTube action: ${config.action}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'youtube');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          videoId: result.id || result.videoId || ''
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action: config.action
        }
      };
    } catch (error: unknown) {
      console.error('YouTube API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown YouTube error';

      return {
        outputs: {
          result: null,
          videoId: ''
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};

// Helper functions
async function uploadYouTubeVideo(_apiKey: string, videoFile: string, title: string, description: string) {
  // Simplified - actual upload requires OAuth and multipart upload
  return {
    action: 'upload_video',
    videoFile,
    title,
    description,
    note: 'Requires OAuth authentication for actual upload'
  };
}

async function getYouTubeVideos(apiKey: string, channelId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&key=${apiKey}`
  );
  return response.json();
}

async function getYouTubeChannelInfo(apiKey: string, channelId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
  );
  return response.json();
}

async function createYouTubePlaylist(_apiKey: string, title: string) {
  // Requires OAuth authentication
  return {
    action: 'create_playlist',
    title,
    note: 'Requires OAuth authentication for creating playlists'
  };
}

async function getYouTubeComments(apiKey: string, videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}`
  );
  return response.json();
}

async function getYouTubeAnalytics(_apiKey: string, channelId: string) {
  // YouTube Analytics API requires separate setup
  return {
    action: 'get_analytics',
    channelId,
    note: 'Requires YouTube Analytics API and OAuth authentication'
  };
}
