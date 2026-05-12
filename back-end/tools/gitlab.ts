import { ToolHandler } from './registry';
import { getNodeFieldValue, trimTrailingSlash, interpolate } from '../utils/common';
import { fetchToolJson } from './utils';

export const gitlabHandler: ToolHandler = async (node, args) => {
  const baseUrl = trimTrailingSlash(getNodeFieldValue(node, 'baseUrl') || 'https://gitlab.com/api/v4');
  const projectIdRaw = String(getNodeFieldValue(node, 'projectId') || args.projectId || '').trim();
  const mergeRequestIid = String(getNodeFieldValue(node, 'mergeRequestIid') || args.mergeRequestIid || args.iid || '').trim();
  const action = String(getNodeFieldValue(node, 'action') || 'get_changes').trim();
  const privateToken = String(getNodeFieldValue(node, 'privateToken') || args.privateToken || '').trim();
  const noteBodyTemplate = String(getNodeFieldValue(node, 'noteBody') || 'Review from n2flow agent: {query}');
  const noteBody = interpolate(noteBodyTemplate, args);

  if (!projectIdRaw) return 'Error: GitLab projectId is required.';
  if (!mergeRequestIid) return 'Error: GitLab mergeRequestIid is required.';

  const projectId = encodeURIComponent(projectIdRaw);
  const mrPath = `${baseUrl}/projects/${projectId}/merge_requests/${encodeURIComponent(mergeRequestIid)}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (privateToken) headers['PRIVATE-TOKEN'] = privateToken;

  try {
    if (action === 'get_notes')       return await fetchToolJson(`${mrPath}/notes?per_page=100`, headers, 'GitLab');
    if (action === 'get_discussions') return await fetchToolJson(`${mrPath}/discussions?per_page=100`, headers, 'GitLab');
    if (action === 'post_note') {
      if (!noteBody.trim()) return 'Error: Note body is empty.';
      return await fetchToolJson(`${mrPath}/notes`, headers, 'GitLab', 'POST', { body: noteBody });
    }
    return await fetchToolJson(`${mrPath}/changes`, headers, 'GitLab');
  } catch (e) {
    return `Error calling GitLab API: ${String(e)}`;
  }
};
