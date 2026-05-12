import { ToolHandler } from './registry';
import { getNodeFieldValue, trimTrailingSlash, interpolate } from '../utils/common';
import { fetchToolJson } from './utils';

export const githubHandler: ToolHandler = async (node, args) => {
  const baseUrl = trimTrailingSlash(getNodeFieldValue(node, 'baseUrl') || 'https://api.github.com');
  const repoFullName = String(getNodeFieldValue(node, 'repoFullName') || args.repoFullName || '').trim();
  const pullRequestNumber = String(getNodeFieldValue(node, 'pullRequestNumber') || args.pullRequestNumber || args.pr || '').trim();
  const action = String(getNodeFieldValue(node, 'action') || 'get_files').trim();
  const githubToken = String(getNodeFieldValue(node, 'githubToken') || args.githubToken || '').trim();
  const noteBodyTemplate = String(getNodeFieldValue(node, 'noteBody') || 'Review from n2flow agent: {query}');
  const noteBody = interpolate(noteBodyTemplate, args);

  if (!repoFullName) return 'Error: GitHub repository (owner/repo) is required.';
  if (!pullRequestNumber) return 'Error: GitHub pull request number is required.';

  const prPath = `${baseUrl}/repos/${repoFullName}/pulls/${pullRequestNumber}`;
  const issuesPath = `${baseUrl}/repos/${repoFullName}/issues/${pullRequestNumber}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'n2flow-agent',
  };
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  try {
    if (action === 'get_files')    return await fetchToolJson(`${prPath}/files`, headers, 'GitHub');
    if (action === 'get_reviews')  return await fetchToolJson(`${prPath}/reviews`, headers, 'GitHub');
    if (action === 'get_comments') return await fetchToolJson(`${issuesPath}/comments`, headers, 'GitHub');
    if (action === 'post_comment') {
      if (!noteBody.trim()) return 'Error: Comment body is empty.';
      return await fetchToolJson(`${issuesPath}/comments`, headers, 'GitHub', 'POST', { body: noteBody });
    }
    return await fetchToolJson(`${prPath}/files`, headers, 'GitHub');
  } catch (e) {
    return `Error calling GitHub API: ${String(e)}`;
  }
};
