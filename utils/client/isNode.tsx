import {
  BeginNodeData,
  CategorizeNodeData,
  GenerateNodeData,
  InterfaceNodeData,
  NodeData,
  RetrievalNodeData,
  SubAgentNodeData,
} from '../../models/flowTypes';

export function isBeginNodeData(data: NodeData): data is BeginNodeData {
  return data.type === 'begin';
}

export function isInterfaceNodeData(data: NodeData): data is InterfaceNodeData {
  return data.type === 'interface';
}

export function isGenerateNodeData(data: NodeData): data is GenerateNodeData {
  return data.type === 'generate';
}

export function isCategorizeNodeData(data: NodeData): data is CategorizeNodeData {
  return data.type === 'categorize';
}

export function isRetrievalNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'retrieval';
}

export function isDecisionNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'decision';
}

export function isKeywordsNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'keywords';
}
export function isExecMysqlNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'execmysql';
}
export function isSubAgentNodeData(data: NodeData): data is SubAgentNodeData {
  return data.type === 'subagent';
}

export function isExecMssqlNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'execmssql';
}
export function isSendMailNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'sendmail';
}
export function isGoogleSearchNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'googlesearch';
}

export function isWikipediaSearchNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'wikipediasearch';
}
export function isRewriteNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'rewrite';
}
export function isHttpRequestNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'httprequest';
}

export function isTransformNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'transform';
}

export function isFileReadNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'fileread';
}

export function isFileWriteNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'filewrite';
}

export function isDelayNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'delay';
}

export function isWebhookNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'webhook';
}

export function isJsonParseNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'jsonparse';
}

export function isTextProcessNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'textprocess';
}

export function isValidateNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'validate';
}

export function isMathNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'math';
}

export function isDateTimeNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'datetime';
}

export function isConditionNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'condition';
}
export function isMattermostNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'mattermost';
}

export function isSlackNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'slack';
}

export function isJiraNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'jira';
}

export function isGitLabNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'gitlab';
}
export { findNextNodes } from '../server/findNextNode';
