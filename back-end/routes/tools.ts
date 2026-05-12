import { Router, Request, Response } from 'express';
import { ToolRegistry } from '../tools';
import { createLogger } from '../utils/logger';
import { toErrorMessage } from '../utils/common';

const logger = createLogger('Tools');

const router = Router();

/**
 * Get list of available tool types
 */
router.get('/tools', (req: Request, res: Response) => {
  try {
    const tools = ToolRegistry.listRegisteredTypes();
    res.json({
      tools: tools.map((name) => ({
        id: name,
        name: name,
        category: getCategoryForTool(name),
      })),
    });
  } catch (err) {
    logger.error('Failed to list tools', { error: toErrorMessage(err) });
    res.status(500).json({ error: 'Failed to list tools' });
  }
});

/**
 * Get details about a specific tool
 */
router.get('/tools/:toolId', (req: Request, res: Response) => {
  try {
    const toolId = String(req.params.toolId);
    const handler = ToolRegistry.getHandler(toolId);

    if (!handler) {
      res.status(404).json({ error: `Tool ${toolId} not found` });
      return;
    }

    res.json({
      id: toolId,
      name: toolId,
      category: getCategoryForTool(toolId),
      description: getDescriptionForTool(toolId),
      requiredParams: getRequiredParamsForTool(toolId),
    });
  } catch (err) {
    logger.error('Failed to get tool details', { error: toErrorMessage(err) });
    res.status(500).json({ error: 'Failed to get tool details' });
  }
});

/**
 * Helper functions to provide tool metadata
 */
function getCategoryForTool(toolName: string): string {
  const categoryMap: Record<string, string> = {
    HTTPRequestComponent: 'Integration',
    MSSQLComponent: 'Database',
    elasticsearch_search: 'Search',
    ElasticsearchComponent: 'Search',
    CodeExecutionComponent: 'Execution',
    ConditionComponent: 'Logic',
    GitLabMergeRequestComponent: 'VCS',
    GitHubComponent: 'VCS',
    SerperApiComponent: 'Search',
  };
  return categoryMap[toolName] || 'Other';
}

function getDescriptionForTool(toolName: string): string {
  const descriptions: Record<string, string> = {
    HTTPRequestComponent: 'Make HTTP requests to external APIs',
    MSSQLComponent: 'Execute SQL queries against MSSQL databases',
    elasticsearch_search: 'Search documents in Elasticsearch indices',
    ElasticsearchComponent: 'Query Elasticsearch for vector and text search',
    CodeExecutionComponent: 'Execute JavaScript code with timeout protection',
    ConditionComponent: 'Branch flow based on conditions',
    GitLabMergeRequestComponent: 'Interact with GitLab merge requests',
    GitHubComponent: 'Interact with GitHub repositories',
    SerperApiComponent: 'Web search using Serper API',
  };
  return descriptions[toolName] || 'Integration tool';
}

function getRequiredParamsForTool(toolName: string): string[] {
  const requiredMap: Record<string, string[]> = {
    HTTPRequestComponent: ['method', 'url'],
    MSSQLComponent: ['server', 'database', 'user', 'password'],
    elasticsearch_search: ['endpoint', 'index'],
    ElasticsearchComponent: ['endpoint', 'index'],
    CodeExecutionComponent: ['code'],
    GitLabMergeRequestComponent: ['project_id', 'merge_request_iid', 'baseUrl'],
    GitHubComponent: ['owner', 'repo'],
    SerperApiComponent: ['query', 'apiKey'],
  };
  return requiredMap[toolName] || [];
}

export default router;
