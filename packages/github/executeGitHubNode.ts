import { ExecutionResult, FlowExecutionContext } from '../models/flowExecutionTypes';
import { GitHubNodeData, FlowNode } from '../models/flowTypes';
import { findNextNodes } from './@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from './@template-processor/templateProcessor';
import { isNodeReady } from './@flow/is-node-ready';
import { FlowStateDispatcher } from './@flow/flow-state-dispatcher';

/**
 * Handler for executing GitHub nodes
 */
export async function executeGitHubNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as GitHubNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.title || ''),
    ...getInputFromTemplate(form.body || ''),
    ...getInputFromTemplate(form.comment || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for GitHub operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'github',
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
    // Validate required fields
    if (!form.token || !form.owner || !form.repository) {
      throw new Error('GitHub token, owner, and repository are required');
    }

    console.log(`Executing GitHub node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_issue':
        if (!form.title) {
          throw new Error('Title is required for creating issues');
        }

        const processedTitle = processTemplate(form.title, vars);
        const processedBody = form.body ? processTemplate(form.body, vars) : '';
        
        result = await createGitHubIssue(form.token, form.owner, form.repository, {
          title: processedTitle,
          body: processedBody,
          labels: form.labels,
          assignees: form.assignees,
        });
        break;

      case 'create_pull_request':
        if (!form.title || !form.head || !form.base) {
          throw new Error('Title, head branch, and base branch are required for creating pull requests');
        }
        
        const processedPrTitle = processTemplate(form.title, vars);
        const processedPrBody = form.body ? processTemplate(form.body, vars) : '';
        
        result = await createGitHubPullRequest(form.token, form.owner, form.repository, {
          title: processedPrTitle,
          body: processedPrBody,
          head: form.head,
          base: form.base,
          labels: form.labels,
          assignees: form.assignees,
        });
        break;

      case 'get_repository':
        result = await getGitHubRepository(form.token, form.owner, form.repository);
        break;

      case 'get_issues':
        result = await getGitHubIssues(form.token, form.owner, form.repository);
        break;

      case 'get_pull_requests':
        result = await getGitHubPullRequests(form.token, form.owner, form.repository);
        break;

      case 'add_comment':
        if (!form.issueNumber || !form.comment) {
          throw new Error('Issue number and comment are required for adding comments');
        }
        
        const processedComment = processTemplate(form.comment, vars);
        result = await addGitHubComment(form.token, form.owner, form.repository, form.issueNumber, processedComment);
        break;

      case 'merge_pull_request':
        if (!form.pullNumber) {
          throw new Error('Pull request number is required for merging');
        }
        
        result = await mergeGitHubPullRequest(form.token, form.owner, form.repository, form.pullNumber);
        break;

      default:
        throw new Error(`Unsupported GitHub action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`GitHub node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'github');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'github';
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
        type: 'github',
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
    console.error('GitHub execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown GitHub error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `GitHub operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'github',
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
      labels: issueData.labels ? issueData.labels.split(',').map((l: string) => l.trim()) : undefined,
      assignees: issueData.assignees ? issueData.assignees.split(',').map((a: string) => a.trim()) : undefined,
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

async function getGitHubPullRequests(token: string, owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
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

async function addGitHubComment(token: string, owner: string, repo: string, issueNumber: string, comment: string) {
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

async function mergeGitHubPullRequest(token: string, owner: string, repo: string, pullNumber: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      commit_title: 'Merge pull request',
      merge_method: 'merge',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorData}`);
  }

  return await response.json();
}
