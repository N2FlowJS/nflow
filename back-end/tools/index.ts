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
import { conditionHandler, jsonParserHandler, dataStreamHandler } from './utils';

export type { ToolDefinition, ExecutionOptions, ToolHandler } from './registry';
export { ToolRegistry } from './registry';

// Register tool handlers
ToolRegistry.register('MSSQLPyODBCComponent', { 
  handler: mssqlHandler, 
  resultParser: (r) => parseJsonSafely(r) ?? r,
});
ToolRegistry.register('elasticsearch_search', { 
  handler: elasticsearchHandler, 
  requiresEmbedding: true 
});
ToolRegistry.register('GitHubMergeRequestComponent', githubHandler);
ToolRegistry.register('GitLabMergeRequestComponent', gitlabHandler);
ToolRegistry.register('FileSystemComponent', filesystemHandler);
ToolRegistry.register('ImageGenerationComponent', imageGenerationHandler);
ToolRegistry.register('CodeExecutionComponent', codeExecutionHandler);
ToolRegistry.register('HTTPRequestComponent', httpHandler);
ToolRegistry.register('SerperSearchComponent', serperHandler);
ToolRegistry.register('ConditionComponent', conditionHandler);
ToolRegistry.register('JSONParserComponent', jsonParserHandler);
ToolRegistry.register('DataStreamComponent', dataStreamHandler);

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
