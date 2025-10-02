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
 * Jira Node Definition
 * 
 * Interact with Jira REST API.
 * Create/update issues, search with JQL, add comments, and manage projects.
 * 
 * Configuration:
 * - serverUrl: Jira server URL (e.g., https://yourcompany.atlassian.net)
 * - username: Jira username/email
 * - apiToken: Jira API token
 * - action: Operation to perform
 * - projectKey: Project key (e.g., PROJ)
 * - issueType: Issue type (Bug, Task, Story, etc.)
 * - issueKey: Issue key for operations (e.g., PROJ-123)
 * - summary: Issue summary (supports {variable} templates)
 * - description: Issue description (supports {variable} templates)
 * - assignee: Assignee username
 * - priority: Priority level
 * - jql: JQL query for searching (supports {variable} templates)
 * - comment: Comment text (supports {variable} templates)
 * 
 * Actions:
 * - create_issue: Create a new issue
 * - update_issue: Update existing issue
 * - get_issue: Get issue details
 * - search_issues: Search issues with JQL
 * - add_comment: Add comment to issue
 * 
 * Example:
 * ```json
 * {
 *   "serverUrl": "https://yourcompany.atlassian.net",
 *   "username": "user@company.com",
 *   "apiToken": "YOUR_API_TOKEN",
 *   "action": "create_issue",
 *   "projectKey": "PROJ",
 *   "issueType": "Bug",
 *   "summary": "Bug found in {module}",
 *   "priority": "High"
 * }
 * ```
 */
export const JiraNodeDefinition: NodeDefinition = {
  id: 'jira',
  name: 'Jira',
  category: NodeCategory.API,
  description: 'Interact with Jira REST API',
  version: '1.0.0',

  inputs: [
    {
      id: 'serverUrl',
      name: 'Server URL',
      type: PortType.TEXT,
      description: 'Jira server URL (e.g., https://yourcompany.atlassian.net)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'https://yourcompany.atlassian.net' },
    },
    {
      id: 'username',
      name: 'Username',
      type: PortType.TEXT,
      description: 'Jira username/email',
      required: true,
      metadata: { inputType: 'text', placeholder: 'user@company.com' },
    },
    {
      id: 'apiToken',
      name: 'API Token',
      type: PortType.TEXT,
      description: 'Jira API token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter API token...', isPassword: true },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Jira operation to perform',
      required: true,
      defaultValue: 'create_issue',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Issue', value: 'create_issue' },
          { label: 'Update Issue', value: 'update_issue' },
          { label: 'Get Issue', value: 'get_issue' },
          { label: 'Search Issues', value: 'search_issues' },
          { label: 'Add Comment', value: 'add_comment' },
        ],
      },
    },
    {
      id: 'projectKey',
      name: 'Project Key',
      type: PortType.TEXT,
      description: 'Project key (e.g., PROJ)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'PROJ' },
    },
    {
      id: 'issueType',
      name: 'Issue Type',
      type: PortType.TEXT,
      description: 'Issue type (Bug, Task, Story, etc.)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Bug' },
    },
    {
      id: 'issueKey',
      name: 'Issue Key',
      type: PortType.TEXT,
      description: 'Issue key for operations (e.g., PROJ-123)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'PROJ-123' },
    },
    {
      id: 'summary',
      name: 'Summary',
      type: PortType.TEXT,
      description: 'Issue summary (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Enter issue summary...' },
    },
    {
      id: 'description',
      name: 'Description',
      type: PortType.TEXT,
      description: 'Issue description (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter issue description...' },
    },
    {
      id: 'assignee',
      name: 'Assignee',
      type: PortType.TEXT,
      description: 'Assignee username',
      required: false,
      metadata: { inputType: 'text', placeholder: 'username' },
    },
    {
      id: 'priority',
      name: 'Priority',
      type: PortType.TEXT,
      description: 'Priority level',
      required: false,
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Highest', value: 'Highest' },
          { label: 'High', value: 'High' },
          { label: 'Medium', value: 'Medium' },
          { label: 'Low', value: 'Low' },
          { label: 'Lowest', value: 'Lowest' },
        ],
      },
    },
    {
      id: 'jql',
      name: 'JQL Query',
      type: PortType.TEXT,
      description: 'JQL query for searching (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'project = PROJ AND status = "In Progress"' },
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
      description: 'Jira API response',
    },
    {
      id: 'issueKey',
      name: 'Issue Key',
      type: PortType.TEXT,
      description: 'Issue key (e.g., PROJ-123)',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.summary) {
      getInputFromTemplate(config.summary as string).forEach(v => variableNames.add(v));
    }
    if (config.description) {
      getInputFromTemplate(config.description as string).forEach(v => variableNames.add(v));
    }
    if (config.comment) {
      getInputFromTemplate(config.comment as string).forEach(v => variableNames.add(v));
    }
    if (config.jql) {
      getInputFromTemplate(config.jql as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...JiraNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.summary as string) || ''),
      ...getInputFromTemplate((config.description as string) || ''),
      ...getInputFromTemplate((config.comment as string) || ''),
      ...getInputFromTemplate((config.jql as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, issueKey: '' },
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
        throw new Error('Jira server URL, username, and API token are required');
      }

      const auth = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');
      let result: any;

      switch (config.action) {
        case 'create_issue':
          if (!config.projectKey || !config.issueType || !config.summary) {
            throw new Error('Project key, issue type, and summary are required for creating issues');
          }
          const processedSummary = processTemplate(config.summary as string, vars);
          const processedDescription = config.description
            ? processTemplate(config.description as string, vars)
            : '';
          result = await createJiraIssue(config.serverUrl as string, auth, {
            projectKey: config.projectKey as string,
            issueType: config.issueType as string,
            summary: processedSummary,
            description: processedDescription,
            assignee: config.assignee as string,
            priority: config.priority as string
          });
          break;

        case 'update_issue':
          if (!config.issueKey) {
            throw new Error('Issue key is required for updating issues');
          }
          result = await updateJiraIssue(config.serverUrl as string, auth, config.issueKey as string, {
            summary: config.summary ? processTemplate(config.summary as string, vars) : undefined,
            description: config.description ? processTemplate(config.description as string, vars) : undefined,
            assignee: config.assignee as string,
            priority: config.priority as string
          });
          break;

        case 'get_issue':
          if (!config.issueKey) {
            throw new Error('Issue key is required for getting issues');
          }
          result = await getJiraIssue(config.serverUrl as string, auth, config.issueKey as string);
          break;

        case 'search_issues':
          if (!config.jql) {
            throw new Error('JQL query is required for searching issues');
          }
          const processedJql = processTemplate(config.jql as string, vars);
          result = await searchJiraIssues(config.serverUrl as string, auth, processedJql);
          break;

        case 'add_comment':
          if (!config.issueKey || !config.comment) {
            throw new Error('Issue key and comment are required for adding comments');
          }
          const processedComment = processTemplate(config.comment as string, vars);
          result = await addJiraComment(config.serverUrl as string, auth, config.issueKey as string, processedComment);
          break;

        default:
          throw new Error(`Unsupported Jira action: ${config.action}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'jira');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          issueKey: result.key || config.issueKey || ''
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action: config.action
        }
      };
    } catch (error: unknown) {
      console.error('Jira API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Jira error';

      return {
        outputs: {
          result: null,
          issueKey: ''
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
async function createJiraIssue(serverUrl: string, auth: string, params: any) {
  const response = await fetch(`${serverUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        project: { key: params.projectKey },
        issuetype: { name: params.issueType },
        summary: params.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: params.description }] }]
        },
        assignee: params.assignee ? { name: params.assignee } : undefined,
        priority: params.priority ? { name: params.priority } : undefined
      }
    })
  });
  return response.json();
}

async function updateJiraIssue(serverUrl: string, auth: string, issueKey: string, params: any) {
  const fields: any = {};
  if (params.summary) fields.summary = params.summary;
  if (params.description) {
    fields.description = {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text: params.description }] }]
    };
  }
  if (params.assignee) fields.assignee = { name: params.assignee };
  if (params.priority) fields.priority = { name: params.priority };

  const response = await fetch(`${serverUrl}/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  return response.status === 204 ? { success: true, key: issueKey } : response.json();
}

async function getJiraIssue(serverUrl: string, auth: string, issueKey: string) {
  const response = await fetch(`${serverUrl}/rest/api/3/issue/${issueKey}`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.json();
}

async function searchJiraIssues(serverUrl: string, auth: string, jql: string) {
  const response = await fetch(`${serverUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.json();
}

async function addJiraComment(serverUrl: string, auth: string, issueKey: string, comment: string) {
  const response = await fetch(`${serverUrl}/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      body: {
        type: 'doc',
        version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: comment }] }]
      }
    })
  });
  return response.json();
}
