import {
  BeginNodeData,
  CacheNodeData,
  CategorizeNodeData,
  CodeNodeData,
  CounterNodeData,
  DisplayNodeData,
  GenerateNodeData,
  InterfaceNodeData,
  LogNodeData,
  LoopNodeData,
  NodeData,
  RetrievalNodeData,
  SubAgentNodeData,
  TemplateNodeData,
  VariableNodeData,
  FileAnalysisNodeData,
  CsvAnalysisNodeData,
  ImageAnalysisNodeData,
  PdfAnalysisNodeData,
  LogAnalysisNodeData,
  ExcelAnalysisNodeData,
  WeChatNodeData,
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
export function isConfluenceNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'confluence';
}
export function isGitHubNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'github';
}
export function isFacebookNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'facebook';
}
export function isGoogleMapNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'googlemap';
}

export function isTwitterNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'twitter';
}

export function isInstagramNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'instagram';
}

export function isLinkedInNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'linkedin';
}

export function isYouTubeNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'youtube';
}

export function isTikTokNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'tiktok';
}

export function isDiscordNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'discord';
}

export function isTelegramNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'telegram';
}

export function isWhatsAppNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'whatsapp';
}

export function isBingSearchNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'bingsearch';
}

export function isDuckGoSearchNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'duckgosearch';
}

export function isWeatherNodeData(data: NodeData): data is RetrievalNodeData {
  return data.type === 'weather';
}

export function isDisplayNodeData(data: NodeData): data is DisplayNodeData {
  return data.type === 'display';
}

export function isLoopNodeData(data: NodeData): data is LoopNodeData {
  return data.type === 'loop';
}

export function isVariableNodeData(data: NodeData): data is VariableNodeData {
  return data.type === 'variable';
}

export function isCodeNodeData(data: NodeData): data is CodeNodeData {
  return data.type === 'code';
}

export function isTemplateNodeData(data: NodeData): data is TemplateNodeData {
  return data.type === 'template';
}

export function isCounterNodeData(data: NodeData): data is CounterNodeData {
  return data.type === 'counter';
}

export function isCacheNodeData(data: NodeData): data is CacheNodeData {
  return data.type === 'cache';
}

export function isLogNodeData(data: NodeData): data is LogNodeData {
  return data.type === 'log';
}

export function isFileAnalysisNodeData(data: NodeData): data is FileAnalysisNodeData {
  return data.type === 'fileanalysis';
}

export function isCsvAnalysisNodeData(data: NodeData): data is CsvAnalysisNodeData {
  return data.type === 'csvanalysis';
}

export function isImageAnalysisNodeData(data: NodeData): data is ImageAnalysisNodeData {
  return data.type === 'imageanalysis';
}

export function isPdfAnalysisNodeData(data: NodeData): data is PdfAnalysisNodeData {
  return data.type === 'pdfanalysis';
}

export function isLogAnalysisNodeData(data: NodeData): data is LogAnalysisNodeData {
  return data.type === 'loganalysis';
}

export function isExcelAnalysisNodeData(data: NodeData): data is ExcelAnalysisNodeData {
  return data.type === 'excelanalysis';
}

export function isWeChatNodeData(data: NodeData): data is WeChatNodeData {
  return data.type === 'wechat';
}

export { findNextNodes } from '../server/findNextNode';
