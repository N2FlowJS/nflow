import {
  isSubAgentNodeData,
  isSendMailNodeData,
  isGoogleSearchNodeData,
  isWikipediaSearchNodeData,
  isRewriteNodeData,
  isHttpRequestNodeData,
  isTransformNodeData,
  isDelayNodeData,
  isFileReadNodeData,
  isFileWriteNodeData,
  isJsonParseNodeData,
  isMathNodeData,
  isValidateNodeData,
  isTextProcessNodeData,
  isConditionNodeData,
  isMattermostNodeData,
  isSlackNodeData,
  isJiraNodeData,
  isGitLabNodeData,
  isConfluenceNodeData,
  isGitHubNodeData,
  isFacebookNodeData,
  isGoogleMapNodeData,
  isTwitterNodeData,
  isInstagramNodeData,
  isLinkedInNodeData,
  isYouTubeNodeData,
  isTikTokNodeData,
  isDiscordNodeData,
  isTelegramNodeData,
  isWhatsAppNodeData,
  isBingSearchNodeData,
  isDuckGoSearchNodeData,
  isWeatherNodeData,
  isDateTimeNodeData,
  isDisplayNodeData,
  isLoopNodeData,
  isVariableNodeData,
  isCodeNodeData,
  isCounterNodeData,
  isCacheNodeData,
  isLogNodeData,
  isImageAnalysisNodeData,
  isPdfAnalysisNodeData,
  isLogAnalysisNodeData,
  isExcelAnalysisNodeData,
  isFileAnalysisNodeData,
  isCsvAnalysisNodeData,
  isWeChatNodeData,
} from '../../../client/isNode';

import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';
import { executeSubAgentNode } from './executeSubAgentNode';
import { executeSendMailNode } from './executeSendMailNode';
import { executeGoogleSearchNode } from './executeGoogleSearchNode';
import { executeBingSearchNode } from './executeBingSearchNode';
import { executeDuckGoSearchNode } from './executeDuckGoSearchNode';
import { executeWikipediaSearchNode } from './executeWikipediaSearchNode';
import { executeRewriteNode } from './executeRewriteNode';
import { executeHttpRequestNode } from './executeHttpRequestNode';
import { executeTransformNode } from './executeTransformNode';
import { executeDelayNode } from './executeDelayNode';
import { executeFileReadNode } from './executeFileReadNode';
import { executeFileWriteNode } from './executeFileWriteNode';
import { executeJsonParseNode } from './executeJsonParseNode';
import { executeMathNode } from './executeMathNode';
import { executeValidateNode } from './executeValidateNode';
import { executeTextProcessNode } from './executeTextProcessNode';
import { executeConditionNode } from './executeConditionNode';
import { executeMattermostNode } from './executeMattermostNode';
import { executeSlackNode } from './executeSlackNode';
import { executeJiraNode } from './executeJiraNode';
import { executeGitLabNode } from './executeGitLabNode';
import { executeConfluenceNode } from './executeConfluenceNode';
import { executeGitHubNode } from './executeGitHubNode';
import { executeFacebookNode } from './executeFacebookNode';
import { executeGoogleMapNode } from './executeGoogleMapNode';
import { executeTwitterNode } from './executeTwitterNode';
import { executeInstagramNode } from './executeInstagramNode';
import { executeLinkedInNode } from './executeLinkedInNode';
import { executeYouTubeNode } from './executeYouTubeNode';
import { executeTikTokNode } from './executeTikTokNode';
import { executeDiscordNode } from './executeDiscordNode';
import { executeTelegramNode } from './executeTelegramNode';
import { executeWhatsAppNode } from './executeWhatsAppNode';
import { executeWeatherNode } from './executeWeatherNode';
import { executeDateTimeNode } from './executeDateTimeNode';
import { executeDisplayNode } from './executeDisplayNode';
import { executeLoopNode } from './executeLoopNode';
import { executeVariableNode } from './executeVariableNode';
import { executeCodeNode } from './executeCodeNode';
import { executeCounterNode } from './executeCounterNode';
import { executeCacheNode } from './executeCacheNode';
import { executeLogNode } from './executeLogNode';
import { executeImageAnalysisNode } from './executeImageAnalysisNode';
import { executePdfAnalysisNode } from './executePdfAnalysisNode';
import { executeLogAnalysisNode } from './executeLogAnalysisNode';
import { executeExcelAnalysisNode } from './executeExcelAnalysisNode';
import { executeFileAnalysisNode } from './executeFileAnalysisNode';
import { executeCsvAnalysisNode } from './executeCsvAnalysisNode';
import { executeWeChatNode } from './executeWeChatNode';
import { NodePlugin } from '../../../../packages/@node-plugin/type';
import { getNodePluginConfig } from '../../../../packages/@node-plugin';
import { ExecutionResult, FlowExecutionContext } from '../../../../packages/@flow/type';

const BUILTIN_PLUGINS: NodePlugin[] = [
  { name: 'subagent', match: (n) => isSubAgentNodeData(n.data), run: (n, c, _cb, d) => executeSubAgentNode(n, c, d) },
  { name: 'sendmail', match: (n) => isSendMailNodeData(n.data), run: (n, c, _cb, d) => executeSendMailNode(n, c, d) },
  {
    name: 'google-search',
    match: (n) => isGoogleSearchNodeData(n.data),
    run: (n, c, _cb, d) => executeGoogleSearchNode(n, c, d),
  },
  {
    name: 'bing-search',
    match: (n) => isBingSearchNodeData(n.data),
    run: (n, c, _cb, d) => executeBingSearchNode(n, c, d),
  },
  {
    name: 'duckgo-search',
    match: (n) => isDuckGoSearchNodeData(n.data),
    run: (n, c, _cb, d) => executeDuckGoSearchNode(n, c, d),
  },
  {
    name: 'wikipedia-search',
    match: (n) => isWikipediaSearchNodeData(n.data),
    run: (n, c, _cb, d) => executeWikipediaSearchNode(n, c, d),
  },
  { name: 'rewrite', match: (n) => isRewriteNodeData(n.data), run: (n, c, cb, d) => executeRewriteNode(n, c, cb, d) },
  {
    name: 'http-request',
    match: (n) => isHttpRequestNodeData(n.data),
    run: (n, c, _cb, d) => executeHttpRequestNode(n, c, d),
  },
  {
    name: 'transform',
    match: (n) => isTransformNodeData(n.data),
    run: (n, c, _cb, d) => executeTransformNode(n, c, d),
  },
  { name: 'delay', match: (n) => isDelayNodeData(n.data), run: (n, c, _cb, d) => executeDelayNode(n, c, d) },
  { name: 'file-read', match: (n) => isFileReadNodeData(n.data), run: (n, c, _cb, d) => executeFileReadNode(n, c, d) },
  {
    name: 'file-write',
    match: (n) => isFileWriteNodeData(n.data),
    run: (n, c, _cb, d) => executeFileWriteNode(n, c, d),
  },
  {
    name: 'json-parse',
    match: (n) => isJsonParseNodeData(n.data),
    run: (n, c, _cb, d) => executeJsonParseNode(n, c, d),
  },
  { name: 'math', match: (n) => isMathNodeData(n.data), run: (n, c, _cb, d) => executeMathNode(n, c, d) },
  { name: 'validate', match: (n) => isValidateNodeData(n.data), run: (n, c, _cb, d) => executeValidateNode(n, c, d) },
  {
    name: 'text-process',
    match: (n) => isTextProcessNodeData(n.data),
    run: (n, c, _cb, d) => executeTextProcessNode(n, c, d),
  },
  {
    name: 'condition',
    match: (n) => isConditionNodeData(n.data),
    run: (n, c, _cb, d) => executeConditionNode(n, c, d),
  },
  {
    name: 'mattermost',
    match: (n) => isMattermostNodeData(n.data),
    run: (n, c, _cb, d) => executeMattermostNode(n, c, d),
  },
  { name: 'slack', match: (n) => isSlackNodeData(n.data), run: (n, c, _cb, d) => executeSlackNode(n, c, d) },
  { name: 'jira', match: (n) => isJiraNodeData(n.data), run: (n, c, _cb, d) => executeJiraNode(n, c, d) },
  { name: 'gitlab', match: (n) => isGitLabNodeData(n.data), run: (n, c, _cb, d) => executeGitLabNode(n, c, d) },
  {
    name: 'confluence',
    match: (n) => isConfluenceNodeData(n.data),
    run: (n, c, _cb, d) => executeConfluenceNode(n, c, d),
  },
  { name: 'github', match: (n) => isGitHubNodeData(n.data), run: (n, c, _cb, d) => executeGitHubNode(n, c, d) },
  { name: 'facebook', match: (n) => isFacebookNodeData(n.data), run: (n, c, _cb, d) => executeFacebookNode(n, c, d) },
  {
    name: 'google-map',
    match: (n) => isGoogleMapNodeData(n.data),
    run: (n, c, _cb, d) => executeGoogleMapNode(n, c, d),
  },
  { name: 'twitter', match: (n) => isTwitterNodeData(n.data), run: (n, c, _cb, d) => executeTwitterNode(n, c, d) },
  {
    name: 'instagram',
    match: (n) => isInstagramNodeData(n.data),
    run: (n, c, _cb, d) => executeInstagramNode(n, c, d),
  },
  { name: 'linkedin', match: (n) => isLinkedInNodeData(n.data), run: (n, c, _cb, d) => executeLinkedInNode(n, c, d) },
  { name: 'youtube', match: (n) => isYouTubeNodeData(n.data), run: (n, c, _cb, d) => executeYouTubeNode(n, c, d) },
  { name: 'tiktok', match: (n) => isTikTokNodeData(n.data), run: (n, c, _cb, d) => executeTikTokNode(n, c, d) },
  { name: 'discord', match: (n) => isDiscordNodeData(n.data), run: (n, c, _cb, d) => executeDiscordNode(n, c, d) },
  { name: 'telegram', match: (n) => isTelegramNodeData(n.data), run: (n, c, _cb, d) => executeTelegramNode(n, c, d) },
  { name: 'whatsapp', match: (n) => isWhatsAppNodeData(n.data), run: (n, c, _cb, d) => executeWhatsAppNode(n, c, d) },
  { name: 'weather', match: (n) => isWeatherNodeData(n.data), run: (n, c, _cb, d) => executeWeatherNode(n, c, d) },
  { name: 'datetime', match: (n) => isDateTimeNodeData(n.data), run: (n, c, _cb, d) => executeDateTimeNode(n, c, d) },
  { name: 'display', match: (n) => isDisplayNodeData(n.data), run: (n, c, _cb, d) => executeDisplayNode(n, c, d) },
  { name: 'loop', match: (n) => isLoopNodeData(n.data), run: (n, c, _cb, d) => executeLoopNode(n, c, d) },
  { name: 'variable', match: (n) => isVariableNodeData(n.data), run: (n, c, _cb, d) => executeVariableNode(n, c, d) },
  { name: 'code', match: (n) => isCodeNodeData(n.data), run: (n, c, _cb, d) => executeCodeNode(n, c, d) },
  { name: 'counter', match: (n) => isCounterNodeData(n.data), run: (n, c, _cb, d) => executeCounterNode(n, c, d) },
  { name: 'cache', match: (n) => isCacheNodeData(n.data), run: (n, c, _cb, d) => executeCacheNode(n, c, d) },
  { name: 'log', match: (n) => isLogNodeData(n.data), run: (n, c, _cb, d) => executeLogNode(n, c, d) },
  {
    name: 'file-analysis',
    match: (n) => isFileAnalysisNodeData(n.data),
    run: (n, c, _cb, d) => executeFileAnalysisNode(n, c, d),
  },
  {
    name: 'csv-analysis',
    match: (n) => isCsvAnalysisNodeData(n.data),
    run: (n, c, _cb, d) => executeCsvAnalysisNode(n, c, d),
  },
  {
    name: 'image-analysis',
    match: (n) => isImageAnalysisNodeData(n.data),
    run: (n, c, _cb, d) => executeImageAnalysisNode(n, c, d),
  },
  {
    name: 'pdf-analysis',
    match: (n) => isPdfAnalysisNodeData(n.data),
    run: (n, c, _cb, d) => executePdfAnalysisNode(n, c, d),
  },
  {
    name: 'log-analysis',
    match: (n) => isLogAnalysisNodeData(n.data),
    run: (n, c, _cb, d) => executeLogAnalysisNode(n, c, d),
  },
  {
    name: 'excel-analysis',
    match: (n) => isExcelAnalysisNodeData(n.data),
    run: (n, c, _cb, d) => executeExcelAnalysisNode(n, c, d),
  },
  { name: 'wechat', match: (n) => isWeChatNodeData(n.data), run: (n, c, _cb, d) => executeWeChatNode(n, c, d) },
];

let PLUGINS: NodePlugin[] = buildPlugins();

function buildPlugins(): NodePlugin[] {
  const cfgMap = getNodePluginConfig();
  // stable ordering with optional explicit order from config
  const withMeta = BUILTIN_PLUGINS.map((p, idx) => {
    // Resolve config by:
    // 1) Direct key match with plugin name
    // 2) Nested config within any package-level object under cfgMap[<pkg>][pluginName]
    const direct = (cfgMap as Record<string, any>)[p.name];
    const nested =
      direct == null
        ? (
            Object.values(cfgMap as Record<string, any>).find(
              (v: any) => v && typeof v === 'object' && p.name in (v as Record<string, any>)
            ) as Record<string, any> | undefined
          )?.[p.name]
        : undefined;
    const cfg = direct ?? nested;
    const enabled = typeof cfg?.enabled === 'boolean' ? cfg.enabled : true;
    const order = typeof cfg?.order === 'number' ? cfg.order : Number.MAX_SAFE_INTEGER;
    return { p, enabled, order, idx };
  });
  return withMeta
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order || a.idx - b.idx)
    .map((m) => m.p);
}

export function registerNodePlugin(plugin: NodePlugin) {
  // Prevent duplicates by name
  if (PLUGINS.some((p) => p.name === plugin.name)) return;
  PLUGINS.push(plugin);
}

export function registerNodePlugins(plugins: NodePlugin[]) {
  for (const p of plugins) registerNodePlugin(p);
}

export function reloadNodePlugins() {
  PLUGINS = buildPlugins();
}

export async function executeNode(
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const plugin = PLUGINS.find((p) => p.match(node));
  if (plugin) {
    return await plugin.run(node, context, callback, dispatcher);
  }
  throw new Error(`Unsupported node type: ${node.type}`);
}
