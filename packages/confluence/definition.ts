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
 * Confluence Node Definition
 * 
 * Interact with Confluence REST API.
 * Create/update pages, search content, manage comments, and access spaces.
 * 
 * Configuration:
 * - serverUrl: Confluence server URL (e.g., https://yourcompany.atlassian.net/wiki)
 * - username: Confluence username/email
 * - apiToken: Confluence API token
 * - action: Operation to perform
 * - spaceKey: Space key (e.g., TEAM)
 * - title: Page title (supports {variable} templates)
 * - content: Page content HTML (supports {variable} templates)
 * - pageId: Page ID for operations
 * - parentPageId: Parent page ID for creating child pages
 * - searchQuery: Search query (supports {variable} templates)
 * - comment: Comment text (supports {variable} templates)
 * 
 * Actions:
 * - create_page: Create a new page
 * - update_page: Update existing page
 * - get_page: Get page details
 * - search_pages: Search pages
 * - add_comment: Add comment to page
 * - get_spaces: List available spaces
 * 
 * Example:
 * ```json
 * {
 *   "serverUrl": "https://yourcompany.atlassian.net/wiki",
 *   "username": "user@company.com",
 *   "apiToken": "YOUR_API_TOKEN",
 *   "action": "create_page",
 *   "spaceKey": "TEAM",
 *   "title": "Meeting Notes - {date}",
 *   "content": "<h1>Meeting Summary</h1><p>{notes}</p>"
 * }
 * ```
 */
export const ConfluenceNodeDefinition: NodeDefinition = {
  id: 'confluence',
  name: 'Confluence',
  category: NodeCategory.API,
  description: 'Interact with Confluence REST API',
  version: '1.0.0',

  inputs: [
    {
      id: 'serverUrl',
      name: 'Server URL',
      type: PortType.TEXT,
      description: 'Confluence server URL (e.g., https://yourcompany.atlassian.net/wiki)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'https://yourcompany.atlassian.net/wiki' },
    },
    {
      id: 'username',
      name: 'Username',
      type: PortType.TEXT,
      description: 'Confluence username/email',
      required: true,
      metadata: { inputType: 'text', placeholder: 'user@company.com' },
    },
    {
      id: 'apiToken',
      name: 'API Token',
      type: PortType.TEXT,
      description: 'Confluence API token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter API token...', isPassword: true },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Confluence operation to perform',
      required: true,
      defaultValue: 'create_page',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Page', value: 'create_page' },
          { label: 'Update Page', value: 'update_page' },
          { label: 'Get Page', value: 'get_page' },
          { label: 'Search Pages', value: 'search_pages' },
          { label: 'Add Comment', value: 'add_comment' },
          { label: 'Get Spaces', value: 'get_spaces' },
        ],
      },
    },
    {
      id: 'spaceKey',
      name: 'Space Key',
      type: PortType.TEXT,
      description: 'Space key (e.g., TEAM)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'TEAM' },
    },
    {
      id: 'title',
      name: 'Title',
      type: PortType.TEXT,
      description: 'Page title (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Enter page title...' },
    },
    {
      id: 'content',
      name: 'Content',
      type: PortType.TEXT,
      description: 'Page content HTML (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: '<h1>Title</h1><p>Content...</p>' },
    },
    {
      id: 'pageId',
      name: 'Page ID',
      type: PortType.TEXT,
      description: 'Page ID for operations',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Page ID' },
    },
    {
      id: 'parentPageId',
      name: 'Parent Page ID',
      type: PortType.TEXT,
      description: 'Parent page ID for creating child pages',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Parent Page ID' },
    },
    {
      id: 'searchQuery',
      name: 'Search Query',
      type: PortType.TEXT,
      description: 'Search query (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Search for pages...' },
    },
    {
      id: 'comment',
      name: 'Comment',
      type: PortType.TEXT,
      description: 'Comment text (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Add a comment...' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'API Result',
      type: PortType.JSON,
      description: 'Confluence API response',
    },
    {
      id: 'pageId',
      name: 'Page ID',
      type: PortType.TEXT,
      description: 'Page ID',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.title) {
      getInputFromTemplate(config.title as string).forEach(v => variableNames.add(v));
    }
    if (config.content) {
      getInputFromTemplate(config.content as string).forEach(v => variableNames.add(v));
    }
    if (config.comment) {
      getInputFromTemplate(config.comment as string).forEach(v => variableNames.add(v));
    }
    if (config.searchQuery) {
      getInputFromTemplate(config.searchQuery as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...ConfluenceNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.title as string) || ''),
      ...getInputFromTemplate((config.content as string) || ''),
      ...getInputFromTemplate((config.comment as string) || ''),
      ...getInputFromTemplate((config.searchQuery as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, pageId: '' },
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

      if (!config.serverUrl || !config.username || !config.apiToken) {
        throw new Error('Confluence server URL, username, and API token are required');
      }

      const auth = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');
      let result: any;

      switch (config.action) {
        case 'create_page':
          if (!config.spaceKey || !config.title || !config.content) {
            throw new Error('Space key, title, and content are required for creating pages');
          }
          const processedTitle = processTemplate(config.title as string, vars);
          const processedContent = processTemplate(config.content as string, vars);
          result = await createConfluencePage(config.serverUrl as string, auth, {
            spaceKey: config.spaceKey as string,
            title: processedTitle,
            content: processedContent,
            parentPageId: config.parentPageId as string
          });
          break;

        case 'update_page':
          if (!config.pageId || !config.title || !config.content) {
            throw new Error('Page ID, title, and content are required for updating pages');
          }
          const processedUpdateTitle = processTemplate(config.title as string, vars);
          const processedUpdateContent = processTemplate(config.content as string, vars);
          result = await updateConfluencePage(config.serverUrl as string, auth, config.pageId as string, {
            title: processedUpdateTitle,
            content: processedUpdateContent
          });
          break;

        case 'get_page':
          if (!config.pageId) {
            throw new Error('Page ID is required for getting pages');
          }
          result = await getConfluencePage(config.serverUrl as string, auth, config.pageId as string);
          break;

        case 'search_pages':
          if (!config.searchQuery) {
            throw new Error('Search query is required for searching pages');
          }
          const processedQuery = processTemplate(config.searchQuery as string, vars);
          result = await searchConfluencePages(config.serverUrl as string, auth, processedQuery, config.spaceKey as string);
          break;

        case 'add_comment':
          if (!config.pageId || !config.comment) {
            throw new Error('Page ID and comment are required for adding comments');
          }
          const processedComment = processTemplate(config.comment as string, vars);
          result = await addConfluenceComment(config.serverUrl as string, auth, config.pageId as string, processedComment);
          break;

        case 'get_spaces':
          result = await getConfluenceSpaces(config.serverUrl as string, auth);
          break;

        default:
          throw new Error(`Unsupported Confluence action: ${config.action}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'confluence');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          pageId: result.id || config.pageId || ''
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action: config.action
        }
      };
    } catch (error: unknown) {
      console.error('Confluence API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Confluence error';

      return {
        outputs: {
          result: null,
          pageId: ''
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
async function createConfluencePage(serverUrl: string, auth: string, params: any) {
  const response = await fetch(`${serverUrl}/rest/api/content`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'page',
      title: params.title,
      space: { key: params.spaceKey },
      body: {
        storage: {
          value: params.content,
          representation: 'storage'
        }
      },
      ancestors: params.parentPageId ? [{ id: params.parentPageId }] : undefined
    })
  });
  return response.json();
}

async function updateConfluencePage(serverUrl: string, auth: string, pageId: string, params: any) {
  // Get current version first
  const currentPage = await getConfluencePage(serverUrl, auth, pageId);
  const newVersion = (currentPage.version?.number || 0) + 1;

  const response = await fetch(`${serverUrl}/rest/api/content/${pageId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'page',
      title: params.title,
      version: { number: newVersion },
      body: {
        storage: {
          value: params.content,
          representation: 'storage'
        }
      }
    })
  });
  return response.json();
}

async function getConfluencePage(serverUrl: string, auth: string, pageId: string) {
  const response = await fetch(`${serverUrl}/rest/api/content/${pageId}?expand=body.storage,version`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.json();
}

async function searchConfluencePages(serverUrl: string, auth: string, query: string, spaceKey?: string) {
  const cql = spaceKey ? `text~"${query}" AND space=${spaceKey}` : `text~"${query}"`;
  const response = await fetch(`${serverUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.json();
}

async function addConfluenceComment(serverUrl: string, auth: string, pageId: string, comment: string) {
  const response = await fetch(`${serverUrl}/rest/api/content`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'comment',
      container: { id: pageId, type: 'page' },
      body: {
        storage: {
          value: comment,
          representation: 'storage'
        }
      }
    })
  });
  return response.json();
}

async function getConfluenceSpaces(serverUrl: string, auth: string) {
  const response = await fetch(`${serverUrl}/rest/api/space`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.json();
}
