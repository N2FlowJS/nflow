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
 * Facebook Node Definition
 * 
 * Interact with Facebook Graph API.
 * Create posts, upload photos, get insights, and manage comments.
 * 
 * Configuration:
 * - accessToken: Facebook access token (required)
 * - pageId: Facebook page ID
 * - action: Operation to perform
 * - message: Post/photo message (supports {variable} templates)
 * - link: Link to share in post
 * - photoUrl: Photo URL for upload
 * - scheduled: Schedule post for later
 * - scheduledTime: Scheduled publish time
 * 
 * Actions:
 * - create_post: Create a new post
 * - upload_photo: Upload photo with message
 * - get_page_info: Get page information
 * - get_posts: Get page posts
 * - get_page_insights: Get page insights/analytics
 * - create_comment: Add comment to post
 * 
 * Example:
 * ```json
 * {
 *   "accessToken": "YOUR_TOKEN",
 *   "pageId": "123456789",
 *   "action": "create_post",
 *   "message": "Check out our new product: {productName}"
 * }
 * ```
 */
export const FacebookNodeDefinition: NodeDefinition = {
  id: 'facebook',
  name: 'Facebook',
  category: NodeCategory.API,
  description: 'Interact with Facebook Graph API',
  version: '1.0.0',

  inputs: [
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'Facebook page access token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter access token...', isPassword: true },
    },
    {
      id: 'pageId',
      name: 'Page ID',
      type: PortType.TEXT,
      description: 'Facebook page ID',
      required: false,
      metadata: { inputType: 'text', placeholder: '123456789' },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Facebook operation to perform',
      required: true,
      defaultValue: 'create_post',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Post', value: 'create_post' },
          { label: 'Upload Photo', value: 'upload_photo' },
          { label: 'Get Page Info', value: 'get_page_info' },
          { label: 'Get Posts', value: 'get_posts' },
          { label: 'Get Page Insights', value: 'get_page_insights' },
          { label: 'Create Comment', value: 'create_comment' },
        ],
      },
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Post/photo message (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter post message...' },
    },
    {
      id: 'link',
      name: 'Link',
      type: PortType.TEXT,
      description: 'Link to share in post',
      required: false,
      metadata: { inputType: 'text', placeholder: 'https://...' },
    },
    {
      id: 'photoUrl',
      name: 'Photo URL',
      type: PortType.TEXT,
      description: 'Photo URL for upload',
      required: false,
      metadata: { inputType: 'text', placeholder: 'https://...' },
    },
    {
      id: 'scheduled',
      name: 'Schedule Post',
      type: PortType.BOOLEAN,
      description: 'Schedule post for later',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'scheduledTime',
      name: 'Scheduled Time',
      type: PortType.TEXT,
      description: 'Scheduled publish time (ISO 8601)',
      required: false,
      metadata: { inputType: 'text', placeholder: '2025-10-07T12:00:00Z' },
    },
    {
      id: 'postId',
      name: 'Post ID',
      type: PortType.TEXT,
      description: 'Post ID for commenting',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Post ID' },
    },
    {
      id: 'comment',
      name: 'Comment',
      type: PortType.TEXT,
      description: 'Comment text (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter comment...' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'API Result',
      type: PortType.JSON,
      description: 'Facebook API response',
    },
    {
      id: 'postId',
      name: 'Post ID',
      type: PortType.TEXT,
      description: 'Created post ID (if applicable)',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.message) {
      getInputFromTemplate(config.message as string).forEach(v => variableNames.add(v));
    }
    if (config.comment) {
      getInputFromTemplate(config.comment as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...FacebookNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.message as string) || ''),
      ...getInputFromTemplate((config.comment as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, postId: '' },
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

      if (!config.accessToken) {
        throw new Error('Facebook access token is required');
      }

      let result: any;

      switch (config.action) {
        case 'create_post':
          if (!config.message) {
            throw new Error('Message is required for creating posts');
          }
          const processedMessage = processTemplate(config.message as string, vars);
          result = await createFacebookPost(
            config.accessToken as string,
            config.pageId as string,
            {
              message: processedMessage,
              link: config.link as string,
              scheduled_publish_time: config.scheduled && config.scheduledTime
                ? Math.floor(new Date(config.scheduledTime as string).getTime() / 1000)
                : undefined,
              published: !config.scheduled,
            }
          );
          break;

        case 'upload_photo':
          if (!config.message || !config.photoUrl) {
            throw new Error('Message and photo URL are required for uploading photos');
          }
          const processedPhotoMessage = processTemplate(config.message as string, vars);
          result = await uploadFacebookPhoto(
            config.accessToken as string,
            config.pageId as string,
            {
              message: processedPhotoMessage,
              url: config.photoUrl as string,
              scheduled_publish_time: config.scheduled && config.scheduledTime
                ? Math.floor(new Date(config.scheduledTime as string).getTime() / 1000)
                : undefined,
              published: !config.scheduled,
            }
          );
          break;

        case 'get_page_info':
          result = await getFacebookPageInfo(config.accessToken as string, config.pageId as string);
          break;

        case 'get_posts':
          result = await getFacebookPosts(config.accessToken as string, config.pageId as string);
          break;

        case 'get_page_insights':
          result = await getFacebookPageInsights(config.accessToken as string, config.pageId as string);
          break;

        case 'create_comment':
          if (!config.postId || !config.comment) {
            throw new Error('Post ID and comment are required for adding comments');
          }
          const processedComment = processTemplate(config.comment as string, vars);
          result = await createFacebookComment(
            config.accessToken as string,
            config.postId as string,
            processedComment
          );
          break;

        default:
          throw new Error(`Unsupported Facebook action: ${config.action}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'facebook');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          postId: result.id || result.post_id || ''
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action: config.action
        }
      };
    } catch (error: unknown) {
      console.error('Facebook API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Facebook error';

      return {
        outputs: {
          result: null,
          postId: ''
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
async function createFacebookPost(accessToken: string, pageId: string, params: any) {
  const baseUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, access_token: accessToken })
  });
  return response.json();
}

async function uploadFacebookPhoto(accessToken: string, pageId: string, params: any) {
  const baseUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, access_token: accessToken })
  });
  return response.json();
}

async function getFacebookPageInfo(accessToken: string, pageId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?access_token=${accessToken}&fields=id,name,category,fan_count`
  );
  return response.json();
}

async function getFacebookPosts(accessToken: string, pageId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/posts?access_token=${accessToken}&fields=id,message,created_time`
  );
  return response.json();
}

async function getFacebookPageInsights(accessToken: string, pageId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/insights?access_token=${accessToken}&metric=page_impressions,page_engaged_users`
  );
  return response.json();
}

async function createFacebookComment(accessToken: string, postId: string, comment: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${postId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: comment, access_token: accessToken })
    }
  );
  return response.json();
}
