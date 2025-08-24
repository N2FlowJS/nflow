import { Edge } from '@xyflow/react';
import React from 'react';
import { BaseForm, BaseNodeData, InputReference } from '@n2flowjs/flow';
// Decentralized node specific forms & data
// Re-export specific node data & form types from decentralized package types for backward compatibility
export type { GenerateNodeData } from '../packages/generate/types';
export type { DecisionForm, DecisionNodeData } from '../packages/decision/types';
export type { BeginNodeData } from '../packages/begin/types';
export type { InterfaceNodeData } from '../packages/interface/types';
export type { CategorizeNodeData } from '../packages/categorize/types';
export type { RetrievalNodeData } from '../packages/retrieval/types';
export type { ExecMysqlNodeData } from '../packages/exec-mysql/types';
export type { ExecMssqlNodeData } from '../packages/exec-mssql/types';
export type { ExecPostgresNodeData } from '../packages/exec-postgres/types';
export type { SubAgentNodeData } from '../packages/subagent/types';
export type { KeywordsNodeData } from '../packages/keywords/types';
export type { RewriteNodeData } from '../packages/rewrite/types';
export type { SendMailNodeData } from '../packages/sendmail/types';
export type { NativeKeywordsNodeData } from '../packages/native-keywords/types';
export type { GoogleSearchNodeData } from '../packages/google-search/types';
export type { SlackNodeData } from '../packages/slack/types';
export type { MattermostNodeData } from '../packages/mattermost/types';
export type { DiscordNodeData } from '../packages/discord/types';
export type { TelegramNodeData } from '../packages/telegram/types';
export type { LinkedInNodeData } from '../packages/linkedin/types';
export type { InstagramNodeData } from '../packages/instagram/types';
export type { WhatsAppNodeData } from '../packages/whatsapp/types';
export type { JiraNodeData } from '../packages/jira/types';
export type { GitHubNodeData } from '../packages/github/types';
export type { GitLabNodeData } from '../packages/gitlab/types';
export type { ConfluenceNodeData } from '../packages/confluence/types';
export type { FacebookNodeData } from '../packages/facebook/types';
export type { GoogleMapNodeData } from '../packages/google-map/types';
export type { TwitterNodeData } from '../packages/twitter/types';
export type { YouTubeNodeData } from '../packages/youtube/types';
export type { TikTokNodeData } from '../packages/tiktok/types';
export type { TextProcessNodeData } from '../packages/text-process/types';
export type { TransformNodeData } from '../packages/transform/types';
export type { FileReadNodeData } from '../packages/file-read/types';
export type { FileWriteNodeData } from '../packages/file-write/types';
export type { DelayNodeData } from '../packages/delay/types';
export type { BingSearchNodeData } from '../packages/bing-search/types';
export type { DuckGoSearchNodeData } from '../packages/duckgo-search/types';
export type { WikipediaSearchNodeData } from '../packages/wikipedia-search/types';
export type { WebhookNodeData } from '../packages/webhook/types';
export type { JsonParseNodeData } from '../packages/jsonparse/types';
export type { ValidateNodeData } from '../packages/validate/types';
export type { MathNodeData } from '../packages/math/types';
export type { DateTimeNodeData } from '../packages/datetime/types';
export type { ConditionNodeData } from '../packages/condition/types';
export type { HttpRequestNodeData } from '../packages/http-request/types';
export type { AgentToolsNodeData } from '../packages/agent-tools/types';
export type { DisplayNodeData } from '../packages/display/types';
export type { LoopNodeData } from '../packages/loop/types';
export type { VariableNodeData } from '../packages/variable/types';
export type { CodeNodeData } from '../packages/code/types';
export type { TemplateNodeData } from '../packages/template/types';
export type { FileAnalysisNodeData } from '../packages/file-analysis/types';
export type { CsvAnalysisNodeData } from '../packages/csv-analysis/types';
export type { ImageAnalysisNodeData } from '../packages/image-analysis/types';
export type { PdfAnalysisNodeData } from '../packages/pdf-analysis/types';
export type { LogAnalysisNodeData } from '../packages/log-analysis/types';
export type { ExcelAnalysisNodeData } from '../packages/excel-analysis/types';
export type { WeatherNodeData } from '../packages/weather/types';
export type { CounterNodeData } from '../packages/counter/types';
export type { CacheNodeData } from '../packages/cache/types';
export type { LogNodeData } from '../packages/log/types';
export type { WeChatNodeData } from '../packages/wechat/types';
import type { AllNodeData, FlowNode } from './nodeDataMap';
import { getDynamicNodeTypeKeys } from '../packages/@node-plugin';
export type { FlowNode } from './nodeDataMap';

// Node types mapping
// Always include core built-ins, then merge dynamic keys from @node-plugin on the server.
const STATIC_NODE_TYPES = {
  begin: 'begin',
  interface: 'interface',
  generate: 'generate',
} as const;

const DYNAMIC_KEYS = (() => {
  try {
    return getDynamicNodeTypeKeys();
  } catch {
    return [] as string[];
  }
})();

export const NODE_TYPES = Object.freeze(
  DYNAMIC_KEYS.reduce((acc, k) => {
    (acc as Record<string, string>)[k] = k;
    return acc;
  }, { ...STATIC_NODE_TYPES } as Record<string, string>)
);
// Allow dynamic plugin node types while preserving autocomplete for built-ins
export type NodeTypeString = string & {};

// Generic plugin node data type retained (legacy support for dynamically loaded plugins)
export type PluginNodeData<TForm = Record<string, unknown>> = BaseNodeData<TForm> & { type: string };

export type NodeDataWithForm<TForm> = BaseNodeData<TForm> & {
  type: NodeTypeString;
};

export interface DecisionCondition {
  input: string;
  operator: string;
  value: string;
}

export interface ConditionGroup {
  conditions: DecisionCondition[];
  logicalOperator: 'AND' | 'OR';
}

export interface DecisionBranch {
  name: string;
  groups: ConditionGroup[];
  groupOperator: 'AND' | 'OR';
  targetNode?: string;
}

// NodeData now sourced from generated union (AllNodeData) to reduce manual maintenance.
export type NodeData = AllNodeData;

// Helper type to extract specific node data
export type ExtractNodeData<T extends NodeTypeString> = Extract<NodeData, { type: T }>;

// Typed node instances

// FlowNode exported by generated file.

// Type for a complete flow
export interface Flow {
  nodes: FlowNode[];
  edges: Edge[];
}

// Node form field configuration
export interface NodeFormField {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'number' | 'tags';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  rows?: number;
}

// Node configuration
export interface NodeConfig {
  type: NodeTypeString;
  icon?: React.ReactNode;
  input: string; // Description of what input the node accepts
  output: string; // Description of what output the node produces
  references?: InputReference[]; // Optional references for input/output
  data: Partial<NodeData>;
}

export interface JiraForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_issue' | 'update_issue' | 'get_issue' | 'search_issues' | 'add_comment';
  serverUrl: string;
  username: string;
  apiToken: string;
  projectKey?: string;
  issueType?: string;
  summary?: string;
  issueKey?: string;
  jql?: string;
  assignee?: string;
  priority?: string;
  comment?: string;
}
