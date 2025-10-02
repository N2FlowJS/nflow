/**
 * GitHub Node Definition
 * 
 * Integration with GitHub API for repository management, issues, and pull requests.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface GitHubConfig {
  name?: string;
  action: 'create_issue' | 'create_pull_request' | 'get_repository' | 'get_issues' | 'create_comment' | 'list_repos';
  token: string;
  owner: string;
  repository: string;
  title?: string;
  body?: string;
  head?: string;
  base?: string;
  issueNumber?: string;
  comment?: string;
  labels?: string[];
  assignees?: string[];
}

const GitHubNodeDefinition: NodeDefinition<GitHubConfig> = {
  id: 'github',
  name: 'GitHub',
  category: NodeCategory.API,
  description: 'Integrate with GitHub API for repository management, issues, and pull requests',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'GitHub operation to perform',
      required: true,
      defaultValue: 'create_issue',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Issue', value: 'create_issue' },
          { label: 'Create Pull Request', value: 'create_pull_request' },
          { label: 'Get Repository', value: 'get_repository' },
          { label: 'Get Issues', value: 'get_issues' },
          { label: 'Create Comment', value: 'create_comment' },
          { label: 'List Repos', value: 'list_repos' },
        ],
      },
    },
    {
      id: 'token',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'GitHub personal access token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'ghp_...', isPassword: true },
    },
    {
      id: 'owner',
      name: 'Owner',
      type: PortType.TEXT,
      description: 'Repository owner (username or organization)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'username or org' },
    },
    {
      id: 'repository',
      name: 'Repository',
      type: PortType.TEXT,
      description: 'Repository name',
      required: true,
      metadata: { inputType: 'text', placeholder: 'repo-name' },
    },
    {
      id: 'title',
      name: 'Title',
      type: PortType.TEXT,
      description: 'Issue or PR title (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Enter title...' },
    },
    {
      id: 'body',
      name: 'Body',
      type: PortType.TEXT,
      description: 'Issue or PR description (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter description...' },
    },
    {
      id: 'head',
      name: 'Head Branch',
      type: PortType.TEXT,
      description: 'Source branch for pull request',
      required: false,
      metadata: { inputType: 'text', placeholder: 'feature-branch' },
    },
    {
      id: 'base',
      name: 'Base Branch',
      type: PortType.TEXT,
      description: 'Target branch for pull request',
      required: false,
      defaultValue: 'main',
      metadata: { inputType: 'text', placeholder: 'main' },
    },
    {
      id: 'issueNumber',
      name: 'Issue Number',
      type: PortType.TEXT,
      description: 'Issue number for comments',
      required: false,
      metadata: { inputType: 'text', placeholder: '123' },
    },
    {
      id: 'comment',
      name: 'Comment',
      type: PortType.TEXT,
      description: 'Comment text (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Add a comment...' },
    },
    {
      id: 'labels',
      name: 'Labels',
      type: PortType.TEXT,
      description: 'Issue or PR labels (comma-separated)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'bug, enhancement' },
    },
    {
      id: 'assignees',
      name: 'Assignees',
      type: PortType.TEXT,
      description: 'GitHub usernames to assign (comma-separated)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'user1, user2' },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'GitHub API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: GitHubConfig) => {
    const variableNames = new Set<string>();
    
    if (config.title) {
      getInputFromTemplate(config.title).forEach(v => variableNames.add(v));
    }
    if (config.body) {
      getInputFromTemplate(config.body).forEach(v => variableNames.add(v));
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
    
    return [...GitHubNodeDefinition.inputs, ...dynamicPorts];
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      // Validate required fields
      if (!config.token || !config.owner || !config.repository) {
        throw new Error('GitHub token, owner, and repository are required');
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
          if (!config.title) {
            throw new Error('Title is required for creating issues');
          }
          
          const processedTitle = processTemplate(config.title, vars);
          const processedBody = config.body ? processTemplate(config.body, vars) : '';
          
          result = await createGitHubIssue(config.token, config.owner, config.repository, {
            title: processedTitle,
            body: processedBody,
            labels: config.labels,
            assignees: config.assignees,
          });
          break;
          
        case 'create_pull_request':
          if (!config.title || !config.head || !config.base) {
            throw new Error('Title, head branch, and base branch are required for creating pull requests');
          }
          
          const processedPrTitle = processTemplate(config.title, vars);
          const processedPrBody = config.body ? processTemplate(config.body, vars) : '';
          
          result = await createGitHubPullRequest(config.token, config.owner, config.repository, {
            title: processedPrTitle,
            body: processedPrBody,
            head: config.head,
            base: config.base,
            labels: config.labels,
            assignees: config.assignees,
          });
          break;
          
        case 'get_repository':
          result = await getGitHubRepository(config.token, config.owner, config.repository);
          break;
          
        case 'get_issues':
          result = await getGitHubIssues(config.token, config.owner, config.repository);
          break;
          
        case 'create_comment':
          if (!config.issueNumber || !config.comment) {
            throw new Error('Issue number and comment are required for adding comments');
          }
          
          const processedComment = processTemplate(config.comment, vars);
          result = await createGitHubComment(config.token, config.owner, config.repository, config.issueNumber, processedComment);
          break;
          
        case 'list_repos':
          result = await listGitHubRepos(config.token, config.owner);
          break;
          
        default:
          throw new Error(`Unsupported GitHub action: ${config.action}`);
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
        error: error?.message || 'Unknown GitHub error',
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

// Helper functions for GitHub API operations
async function createGitHubIssue(token: string, owner: string, repo: string, issueData: any) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title: issueData.title,
      body: issueData.body || '',
      labels: issueData.labels || [],
      assignees: issueData.assignees || [],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function createGitHubPullRequest(token: string, owner: string, repo: string, prData: any) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title: prData.title,
      body: prData.body || '',
      head: prData.head,
      base: prData.base,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getGitHubRepository(token: string, owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function getGitHubIssues(token: string, owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function createGitHubComment(token: string, owner: string, repo: string, issueNumber: string, comment: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      body: comment,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

async function listGitHubRepos(token: string, owner: string) {
  const response = await fetch(`https://api.github.com/users/${owner}/repos`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}

export default GitHubNodeDefinition;
