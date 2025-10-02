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
 * LinkedIn Node Definition
 * 
 * Interact with LinkedIn API.
 * Create posts, publish articles, get profile/company info, and manage connections.
 * 
 * Configuration:
 * - accessToken: LinkedIn access token (required)
 * - action: Operation to perform
 * - postText: Post text content (supports {variable} templates)
 * - articleTitle: Article title (supports {variable} templates)
 * - articleContent: Article content (supports {variable} templates)
 * - companyId: Company ID for company operations
 * 
 * Actions:
 * - create_post: Create a LinkedIn post
 * - get_profile: Get user profile information
 * - get_company_info: Get company information
 * - create_article: Publish an article
 * - get_connections: Get user connections
 * 
 * Example:
 * ```json
 * {
 *   "accessToken": "YOUR_TOKEN",
 *   "action": "create_post",
 *   "postText": "Excited to announce {announcement}!"
 * }
 * ```
 */
export const LinkedInNodeDefinition: NodeDefinition = {
  id: 'linkedin',
  name: 'LinkedIn',
  category: NodeCategory.API,
  description: 'Interact with LinkedIn API',
  version: '1.0.0',

  inputs: [
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'LinkedIn access token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter access token...', isPassword: true },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'LinkedIn operation to perform',
      required: true,
      defaultValue: 'create_post',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Post', value: 'create_post' },
          { label: 'Get Profile', value: 'get_profile' },
          { label: 'Get Company Info', value: 'get_company_info' },
          { label: 'Create Article', value: 'create_article' },
          { label: 'Get Connections', value: 'get_connections' },
        ],
      },
    },
    {
      id: 'postText',
      name: 'Post Text',
      type: PortType.TEXT,
      description: 'Post text content (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Share your thoughts...' },
    },
    {
      id: 'articleTitle',
      name: 'Article Title',
      type: PortType.TEXT,
      description: 'Article title (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Article title' },
    },
    {
      id: 'articleContent',
      name: 'Article Content',
      type: PortType.TEXT,
      description: 'Article content (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Article content...' },
    },
    {
      id: 'companyId',
      name: 'Company ID',
      type: PortType.TEXT,
      description: 'Company ID for company operations',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Company ID' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'API Result',
      type: PortType.JSON,
      description: 'LinkedIn API response',
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

    if (config.postText) {
      getInputFromTemplate(config.postText as string).forEach(v => variableNames.add(v));
    }
    if (config.articleTitle) {
      getInputFromTemplate(config.articleTitle as string).forEach(v => variableNames.add(v));
    }
    if (config.articleContent) {
      getInputFromTemplate(config.articleContent as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...LinkedInNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.postText as string) || ''),
      ...getInputFromTemplate((config.articleTitle as string) || ''),
      ...getInputFromTemplate((config.articleContent as string) || '')
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
        throw new Error('LinkedIn access token is required');
      }

      let result: any;

      switch (config.action) {
        case 'create_post':
          if (!config.postText) {
            throw new Error('Post text is required for creating posts');
          }
          const processedPost = processTemplate(config.postText as string, vars);
          result = await createLinkedInPost(config.accessToken as string, processedPost);
          break;

        case 'get_profile':
          result = await getLinkedInProfile(config.accessToken as string);
          break;

        case 'get_company_info':
          if (!config.companyId) {
            throw new Error('Company ID is required for getting company info');
          }
          result = await getLinkedInCompanyInfo(config.accessToken as string, config.companyId as string);
          break;

        case 'create_article':
          if (!config.articleTitle || !config.articleContent) {
            throw new Error('Article title and content are required for creating articles');
          }
          const processedTitle = processTemplate(config.articleTitle as string, vars);
          const processedContent = processTemplate(config.articleContent as string, vars);
          result = await createLinkedInArticle(config.accessToken as string, processedTitle, processedContent);
          break;

        case 'get_connections':
          result = await getLinkedInConnections(config.accessToken as string);
          break;

        default:
          throw new Error(`Unsupported LinkedIn action: ${config.action}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'linkedin');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          postId: result.id || ''
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action: config.action
        }
      };
    } catch (error: unknown) {
      console.error('LinkedIn API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown LinkedIn error';

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
async function createLinkedInPost(accessToken: string, text: string) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: 'urn:li:person:AUTHOR_ID',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });
  return response.json();
}

async function getLinkedInProfile(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}

async function getLinkedInCompanyInfo(accessToken: string, companyId: string) {
  const response = await fetch(`https://api.linkedin.com/v2/organizations/${companyId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}

async function createLinkedInArticle(accessToken: string, title: string, content: string) {
  const response = await fetch('https://api.linkedin.com/v2/articles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      content,
      visibility: 'PUBLIC'
    })
  });
  return response.json();
}

async function getLinkedInConnections(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/connections?q=viewer', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}
