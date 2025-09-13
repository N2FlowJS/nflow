import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { FlowNode } from '../../models/flowTypes';
import { GitLabNodeData } from './types';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing GitLab nodes
 */
export async function executeGitLabNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as GitLabNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.title || ''),
    ...getInputFromTemplate(form.description || ''),
    ...getInputFromTemplate(form.comment || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for GitLab operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'gitlab',
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
    if (!form.serverUrl || !form.accessToken) {
      throw new Error('GitLab server URL and access token are required');
    }

    console.log(`Executing GitLab node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_issue':
        if (!form.projectId || !form.title) {
          throw new Error('Project ID and title are required for creating issues');
        }

        const processedTitle = processTemplate(form.title, vars);
        const processedDescription = form.description ? processTemplate(form.description, vars) : '';
        
        result = await createGitLabIssue(form.serverUrl, form.accessToken, {
          projectId: form.projectId,
          title: processedTitle,
          description: processedDescription,
          assigneeId: form.assigneeId,
          labels: form.labels,
        });
        break;

      case 'create_merge_request':
        if (!form.projectId || !form.title || !form.sourceBranch || !form.targetBranch) {
          throw new Error('Project ID, title, source branch, and target branch are required for creating merge requests');
        }
        
        const processedMrTitle = processTemplate(form.title, vars);
        const processedMrDescription = form.description ? processTemplate(form.description, vars) : '';
        
        result = await createGitLabMergeRequest(form.serverUrl, form.accessToken, {
          projectId: form.projectId,
          title: processedMrTitle,
          description: processedMrDescription,
          sourceBranch: form.sourceBranch,
          targetBranch: form.targetBranch,
          assigneeId: form.assigneeId,
        });
        break;

      case 'get_project':
        if (!form.projectId) {
          throw new Error('Project ID is required for getting project information');
        }
        
        result = await getGitLabProject(form.serverUrl, form.accessToken, form.projectId);
        break;

      case 'get_issues':
        if (!form.projectId) {
          throw new Error('Project ID is required for getting issues');
        }
        
        result = await getGitLabIssues(form.serverUrl, form.accessToken, form.projectId);
        break;

      case 'create_comment':
        if (!form.projectId || !form.issueIid || !form.comment) {
          throw new Error('Project ID, issue IID, and comment are required for adding comments');
        }
        
        const processedComment = processTemplate(form.comment, vars);
        result = await createGitLabComment(form.serverUrl, form.accessToken, form.projectId, form.issueIid, processedComment);
        break;

      default:
        throw new Error(`Unsupported GitLab action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`GitLab node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'gitlab');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'gitlab';
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
        type: 'gitlab',
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
    console.error('GitLab execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown GitLab error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `GitLab operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'gitlab',
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
