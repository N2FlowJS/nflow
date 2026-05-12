import { FlowNode } from '../flowTypes';
import { ExecutionOptions, ToolDefinition, ToolHandler, ToolRegistry } from './registry';
import { parseJsonSafely } from '../utils/common';
import { mssqlHandler } from './mssql';
import { elasticsearchHandler } from './elasticsearch';
import { githubHandler } from './github';
import { gitlabHandler } from './gitlab';
import { filesystemHandler } from './filesystem';
import { imageGenerationHandler } from './image';
import { codeExecutionHandler } from './code';
import { httpHandler } from './http';
import { serperHandler } from './serper';
import { conditionHandler } from './utils';

export type { ToolDefinition, ExecutionOptions, ToolHandler } from './registry';
export { ToolRegistry } from './registry';

// Register tool handlers
ToolRegistry.register('MSSQLPyODBCComponent', { 
  handler: mssqlHandler, 
  resultParser: (r) => parseJsonSafely(r) ?? r,
  metadata: {
    category: 'Database',
    description: 'Execute SQL queries against MSSQL databases',
    requiredParams: ['server', 'database', 'user', 'password']
  }
});
ToolRegistry.register('elasticsearch_search', { 
  handler: elasticsearchHandler, 
  requiresEmbedding: true,
  metadata: {
    category: 'Search',
    description: 'Search documents in Elasticsearch indices',
    requiredParams: ['endpoint', 'index']
  }
});
ToolRegistry.register('GitHubMergeRequestComponent', githubHandler, {
  category: 'VCS',
  description: 'Interact with GitHub repositories',
  requiredParams: ['owner', 'repo']
});
ToolRegistry.register('GitLabMergeRequestComponent', gitlabHandler, {
  category: 'VCS',
  description: 'Interact with GitLab merge requests',
  requiredParams: ['project_id', 'merge_request_iid', 'baseUrl']
});
ToolRegistry.register('FileSystemComponent', filesystemHandler, {
  category: 'System',
  description: 'Read/Write files from local system',
});
ToolRegistry.register('ImageGenerationComponent', imageGenerationHandler, {
  category: 'AI',
  description: 'Generate images using DALL-E or other models',
  requiredParams: ['prompt']
});
ToolRegistry.register('CodeExecutionComponent', codeExecutionHandler, {
  category: 'Execution',
  description: 'Execute JavaScript code with timeout protection',
  requiredParams: ['code']
});
ToolRegistry.register('HTTPRequestComponent', httpHandler, {
  category: 'Integration',
  description: 'Make HTTP requests to external APIs',
  requiredParams: ['method', 'url']
});
ToolRegistry.register('SerperSearchComponent', serperHandler, {
  category: 'Search',
  description: 'Web search using Serper API',
  requiredParams: ['query', 'apiKey']
});
ToolRegistry.register('ConditionComponent', conditionHandler, {
  category: 'Logic',
  description: 'Branch flow based on conditions',
  requiredParams: ['condition']
});

export const executeToolNode = async (
  node: FlowNode,
  args: Record<string, string>,
  options: ExecutionOptions,
): Promise<string> => {
  const { log } = options;
  log(`[Tool: ${node?.data?.label || node?.id}] Executing with args: ${JSON.stringify(args)}`);

  const handler = ToolRegistry.getHandler(node?.data?.type || '');

  if (!handler) {
    return `Error: Unsupported tool node type "${node?.data?.type || 'unknown'}".`;
  }

  return handler(node, args, options);
};
