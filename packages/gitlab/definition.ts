/**
 * GitLab Node Definition
 * 
 * Integration with GitLab API for issue management, merge requests, and project operations.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface GitLabConfig {
  name?: string;
  description?: string;
  action: 'create_issue' | 'create_merge_request' | 'get_project' | 'get_issues' | 'create_comment';
  serverUrl: string;
  accessToken: string;
  projectId?: string;
  title?: string;
  issueIid?: string;
  sourceBranch?: string;
  targetBranch?: string;
  assigneeId?: string;
  labels?: string[];
  comment?: string;
}

const GitLabNodeDefinition: NodeDefinition<GitLabConfig> = {
  id: 'gitlab',
  name: 'GitLab',
  category: NodeCategory.API,
  description: 'Integrate with GitLab API for issues, merge requests, and project management',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'GitLab operation to perform',
      required: true,
      defaultValue: 'create_issue',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Issue', value: 'create_issue' },
          { label: 'Create Merge Request', value: 'create_merge_request' },
          { label: 'Get Project', value: 'get_project' },
          { label: 'Get Issues', value: 'get_issues' },
          { label: 'Create Comment', value: 'create_comment' },
        ],
      },
    },
    {
      id: 'serverUrl',
      name: 'Server URL',
      type: PortType.TEXT,
      description: 'GitLab server URL (e.g., https://gitlab.com)',
      required: true,
      defaultValue: 'https://gitlab.com',
      metadata: { inputType: 'text', placeholder: 'https://gitlab.com' },
    },
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'GitLab personal access token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'glpat-...', isPassword: true },
    },
    {
      id: 'projectId',
      name: 'Project ID',
      type: PortType.TEXT,
      description: 'GitLab project ID or path (e.g., 123 or namespace/project)',
      required: true,
      metadata: { inputType: 'text', placeholder: '123 or namespace/project' },
    },
    {
      id: 'title',
      name: 'Title',
      type: PortType.TEXT,
      description: 'Issue or MR title (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Enter title...' },
    },
    {
      id: 'description',
      name: 'Description',
      type: PortType.TEXT,
      description: 'Issue or MR description (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter description...' },
    },
    {
      id: 'issueIid',
      name: 'Issue IID',
      type: PortType.TEXT,
      description: 'Issue internal ID (for comments)',
      required: false,
      metadata: { inputType: 'text', placeholder: '123' },
    },
    {
      id: 'sourceBranch',
      name: 'Source Branch',
      type: PortType.TEXT,
      description: 'Source branch for merge request',
      required: false,
      metadata: { inputType: 'text', placeholder: 'feature-branch' },
    },
    {
      id: 'targetBranch',
      name: 'Target Branch',
      type: PortType.TEXT,
      description: 'Target branch for merge request',
      required: false,
      defaultValue: 'main',
      metadata: { inputType: 'text', placeholder: 'main' },
    },
    {
      id: 'assigneeId',
      name: 'Assignee ID',
      type: PortType.TEXT,
      description: 'User ID to assign',
      required: false,
      metadata: { inputType: 'text', placeholder: 'User ID' },
    },
    {
      id: 'labels',
      name: 'Labels',
      type: PortType.TEXT,
      description: 'Issue labels (comma-separated)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'bug, feature' },
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
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'GitLab API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: GitLabConfig) => {
    const variableNames = new Set<string>();
    
    if (config.title) {
      getInputFromTemplate(config.title).forEach(v => variableNames.add(v));
    }
    if (config.description) {
      getInputFromTemplate(config.description).forEach(v => variableNames.add(v));
    }
    if (config.comment) {
      getInputFromTemplate(config.comment).forEach(v => variableNames.add(v));
    }
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    
    return [...GitLabNodeDefinition.inputs, ...dynamicPorts];
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      // Validate required fields
      if (!config.serverUrl || !config.accessToken) {
        throw new Error('GitLab server URL and access token are required');
      }
      
      // Prepare template variables
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      let result: any;
      
      switch (config.action) {
        case 'create_issue':
          if (!config.projectId || !config.title) {
            throw new Error('Project ID and title are required for creating issues');
          }
          
          const processedTitle = processTemplate(config.title, vars);
          const processedDescription = config.description ? processTemplate(config.description, vars) : '';
          
          result = await createGitLabIssue(config.serverUrl, config.accessToken, {
            projectId: config.projectId,
            title: processedTitle,
            description: processedDescription,
            assigneeId: config.assigneeId,
            labels: config.labels,
          });
          break;
          
        case 'create_merge_request':
          if (!config.projectId || !config.title || !config.sourceBranch || !config.targetBranch) {
            throw new Error('Project ID, title, source branch, and target branch are required for creating merge requests');
          }
          
          const processedMrTitle = processTemplate(config.title, vars);
          const processedMrDescription = config.description ? processTemplate(config.description, vars) : '';
          
          result = await createGitLabMergeRequest(config.serverUrl, config.accessToken, {
            projectId: config.projectId,
            title: processedMrTitle,
            description: processedMrDescription,
            sourceBranch: config.sourceBranch,
            targetBranch: config.targetBranch,
            assigneeId: config.assigneeId,
          });
          break;
          
        case 'get_project':
          if (!config.projectId) {
            throw new Error('Project ID is required for getting project information');
          }
          
          result = await getGitLabProject(config.serverUrl, config.accessToken, config.projectId);
          break;
          
        case 'get_issues':
          if (!config.projectId) {
            throw new Error('Project ID is required for getting issues');
          }
          
          result = await getGitLabIssues(config.serverUrl, config.accessToken, config.projectId);
          break;
          
        case 'create_comment':
          if (!config.projectId || !config.issueIid || !config.comment) {
            throw new Error('Project ID, issue IID, and comment are required for adding comments');
          }
          
          const processedComment = processTemplate(config.comment, vars);
          result = await createGitLabComment(config.serverUrl, config.accessToken, config.projectId, config.issueIid, processedComment);
          break;
          
        default:
          throw new Error(`Unsupported GitLab action: ${config.action}`);
      }
      
      const resultText = JSON.stringify(result, null, 2);
      
      return {
        outputs: {
          output: resultText,
        },
        status: 'success',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output: resultText,
          },
        },
      };
    } catch (error: any) {
      return {
        outputs: {},
        status: 'error',
        error: error?.message || 'Unknown GitLab error',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output: `Error: ${error?.message}`,
          },
        },
      };
    }
  },
};

// Helper functions for GitLab API operations
async function createGitLabIssue(serverUrl: string, accessToken: string, issueData: any) {
  const response = await fetch(`${serverUrl}/api/v4/projects/${issueData.projectId}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: issueData.title,
      description: issueData.description || '',
      assignee_id: issueData.assigneeId ? parseInt(issueData.assigneeId) : undefined,
      labels: issueData.labels ? issueData.labels.join(',') : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitLab API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function createGitLabMergeRequest(serverUrl: string, accessToken: string, mrData: any) {
  const response = await fetch(`${serverUrl}/api/v4/projects/${mrData.projectId}/merge_requests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: mrData.title,
      description: mrData.description || '',
      source_branch: mrData.sourceBranch,
      target_branch: mrData.targetBranch,
      assignee_id: mrData.assigneeId ? parseInt(mrData.assigneeId) : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitLab API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getGitLabProject(serverUrl: string, accessToken: string, projectId: string) {
  const response = await fetch(`${serverUrl}/api/v4/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitLab API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getGitLabIssues(serverUrl: string, accessToken: string, projectId: string) {
  const response = await fetch(`${serverUrl}/api/v4/projects/${projectId}/issues`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitLab API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function createGitLabComment(serverUrl: string, accessToken: string, projectId: string, issueIid: string, comment: string) {
  const response = await fetch(`${serverUrl}/api/v4/projects/${projectId}/issues/${issueIid}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: comment,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitLab API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

export default GitLabNodeDefinition;
