import { Edge, Node } from '@xyflow/react';
import React from 'react';
import { BaseForm, BaseNodeData, InputReference } from '@n2flowjs/flow';
// Decentralized node specific forms & data
import { GenerateForm, GenerateNodeData } from '../packages/generate/types';
import { KeywordsForm, KeywordsNodeData } from '../packages/keywords/types';
import { RewriteForm, RewriteNodeData } from '../packages/rewrite/types';
import { GoogleSearchForm, GoogleSearchNodeData } from '../packages/google-search/types';
import { SlackNodeData } from '../packages/slack/types';
import { MattermostNodeData } from '../packages/mattermost/types';
import { DiscordNodeData } from '../packages/discord/types';
import { TelegramNodeData } from '../packages/telegram/types';
import { LinkedInNodeData } from '../packages/linkedin/types';
import { InstagramNodeData } from '../packages/instagram/types';
import { WhatsAppNodeData } from '../packages/whatsapp/types';
import { JiraNodeData } from '../packages/jira/types';
import { GitHubNodeData } from '../packages/github/types';
import { GitLabNodeData } from '../packages/gitlab/types';
import { ConfluenceNodeData } from '../packages/confluence/types';
import { FacebookNodeData } from '../packages/facebook/types';
import { GoogleMapNodeData } from '../packages/googlemap/types';
import { TwitterNodeData } from '../packages/twitter/types';
import { BingSearchForm, BingSearchNodeData } from '../packages/bing-search/types';
import { DuckGoSearchForm, DuckGoSearchNodeData } from '../packages/duckgo-search/types';
import { WikipediaSearchForm, WikipediaSearchNodeData } from '../packages/wikipedia-search/types';

// Node types mapping
export const NODE_TYPES = {
  begin: 'begin',
  interface: 'interface',
  generate: 'generate',
  categorize: 'categorize',
  retrieval: 'retrieval',
  decision: 'decision',
  keywords: 'keywords',
  execmysql: 'execmysql',
  execmssql: 'execmssql',
  execpostgres: 'execpostgres',
  subagent: 'subagent',
  agent: 'agent',
  sendmail: 'sendmail',
  googlesearch: 'googlesearch',
  bingsearch: 'bingsearch',
  duckgosearch: 'duckgosearch',
  wikipediasearch: 'wikipediasearch',
  rewrite: 'rewrite',
  httprequest: 'httprequest',
  transform: 'transform',
  fileread: 'fileread',
  filewrite: 'filewrite',
  delay: 'delay',
  webhook: 'webhook',
  jsonparse: 'jsonparse',
  textprocess: 'textprocess',
  validate: 'validate',
  math: 'math',
  datetime: 'datetime',
  condition: 'condition',
  mattermost: 'mattermost',
  slack: 'slack',
  jira: 'jira',
  gitlab: 'gitlab',
  confluence: 'confluence',
  github: 'github',
  facebook: 'facebook',
  googlemap: 'googlemap',
  twitter: 'twitter',
  instagram: 'instagram',
  linkedin: 'linkedin',
  youtube: 'youtube',
  tiktok: 'tiktok',
  discord: 'discord',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  weather: 'weather',
  agenttools: 'agenttools',
  display: 'display',
  loop: 'loop',
  variable: 'variable',
  code: 'code',
  template: 'template',
  counter: 'counter',
  cache: 'cache',
  log: 'log',
  fileanalysis: 'fileanalysis',
  csvanalysis: 'csvanalysis',
  imageanalysis: 'imageanalysis',
  pdfanalysis: 'pdfanalysis',
  loganalysis: 'loganalysis',
  excelanalysis: 'excelanalysis',
  // Chinese platform nodes
  wechat: 'wechat',
  nativekeywords: 'nativekeywords',
} as const;
// Allow dynamic plugin node types while preserving autocomplete for built-ins
export type NodeTypeString = string & {};



// Form types for each node
export interface BeginForm extends BaseForm {
  greeting: string;
  variables: {
    title: string;
    dataIndex: number;
    key: string;
  }[];
}

export interface InterfaceForm extends BaseForm {
  // No additional fields needed for Interface nodes as they just display previous output
  displayFormat?: 'text' | 'markdown' | 'html';
}

// GenerateForm & KeywordsForm moved to package type files

export interface NativeKeywordsForm extends BaseForm {
  text: string; // template with ${var}
  language?: 'en' | 'vi' | 'auto';
  maxResults?: number;
  minLength?: number;
  removeDigits?: boolean;
  extraStopwords?: string[]; // custom stopwords
}

export interface ICategory {
  name: string;
  description?: string;
  examples?: string[];
  targetNode?: string; // Add target node field
}

export interface CategorizeForm extends BaseForm {
  categories: ICategory[];
  defaultCategory: string;
  model: string;
}
export interface DecisionForm extends BaseForm {
  branches: DecisionBranch[];
  defaultTarget: string;
}

export interface RetrievalForm extends BaseForm {
  knowledgeIds: string[];
  maxResults: number;
  threshold: number;
}

export interface ExecMysqlForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  timeout?: number;
  maxRows?: number;
}

export interface SubAgentForm extends BaseForm {
  agentId: string;
  agentName?: string;
  variables?: { [key: string]: string };
  timeout?: number;
  inheritContext?: boolean;
}

export interface AgentForm extends BaseForm {
  systemMessage: string;
  model?: string;
}

export interface AgentToolsForm extends BaseForm {
  toolIds: string[];
}

export interface ExecMssqlForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  timeout?: number;
  maxRows?: number;
  trustServerCertificate?: boolean;
}

export interface ExecPostgresForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  timeout?: number;
  maxRows?: number;
  ssl?: boolean;
}

export interface SendMailForm extends BaseForm {
  name: string;
  description?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  useSystemConfig?: boolean;
}
// (external) GoogleSearchForm, WikipediaSearchForm

// RewriteForm moved to package type file

export interface HttpRequestForm extends BaseForm {
  name: string;
  description?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: { [key: string]: string };
  body?: string;
  timeout?: number;
  followRedirects?: boolean;
}

export interface TransformForm extends BaseForm {
  name: string;
  description?: string;
  transformType: 'json' | 'text' | 'array' | 'object';
  transformation: string;
  inputData: string;
}

export interface FileReadForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  encoding?: 'utf8' | 'base64' | 'binary';
  maxSize?: number;
}

export interface FileWriteForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  content: string;
  encoding?: 'utf8' | 'base64' | 'binary';
  overwrite?: boolean;
}

export interface DelayForm extends BaseForm {
  name: string;
  description?: string;
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export interface WebhookForm extends BaseForm {
  name: string;
  description?: string;
  webhookUrl: string;
  method: 'GET' | 'POST' | 'PUT';
  payload: string;
  headers?: { [key: string]: string };
  retryCount?: number;
}

export interface JsonParseForm extends BaseForm {
  name: string;
  description?: string;
  jsonData: string;
  operation: 'parse' | 'stringify' | 'extract' | 'validate';
  jsonPath?: string;
  outputFormat?: 'object' | 'array' | 'string';
}

export interface TextProcessForm extends BaseForm {
  name: string;
  description?: string;
  inputText: string;
  operation: 'uppercase' | 'lowercase' | 'trim' | 'replace' | 'split' | 'join' | 'regex' | 'length';
  searchValue?: string;
  replaceValue?: string;
  separator?: string;
  regexPattern?: string;
  regexFlags?: string;
}

export interface ValidateForm extends BaseForm {
  name: string;
  description?: string;
  inputData: string;
  validationType: 'email' | 'url' | 'phone' | 'json' | 'number' | 'date' | 'custom';
  customPattern?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}

export interface MathForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt' | 'abs' | 'round' | 'min' | 'max';
  value1: string;
  value2?: string;
  precision?: number;
}

export interface DateTimeForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'now' | 'format' | 'parse' | 'add' | 'subtract' | 'compare' | 'timezone';
  inputDate?: string;
  format?: string;
  amount?: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  timezone?: string;
}

export interface ConditionForm extends BaseForm {
  name: string;
  description?: string;
  leftValue: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  rightValue: string;
  trueValue: string;
  falseValue: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date';
}

// Specialized node data types
export type BeginNodeData = BaseNodeData<BeginForm> & {
  type: 'begin';
};

// Generic node data shape for plugin-provided nodes (dynamic types)
export type PluginNodeData<TForm = Record<string, unknown>> = BaseNodeData<TForm> & {
  type: string; // plugin-defined type id
};

export type InterfaceNodeData = BaseNodeData<InterfaceForm> & {
  type: 'interface';
};


export type CategorizeNodeData = BaseNodeData<CategorizeForm> & {
  type: 'categorize';
};
export type DecisionNodeData = BaseNodeData<DecisionForm> & {
  type: 'decision';
};

export type RetrievalNodeData = BaseNodeData<RetrievalForm> & {
  type: 'retrieval';
};
export type ExecMysqlNodeData = BaseNodeData<ExecMysqlForm> & {
  type: 'execmysql';
};
export type SubAgentNodeData = BaseNodeData<SubAgentForm> & {
  type: 'subagent';
};
export type AgentNodeData = BaseNodeData<AgentForm> & {
  type: 'agent';
};

export type ExecMssqlNodeData = BaseNodeData<ExecMssqlForm> & {
  type: 'execmssql';
};
export type ExecPostgresNodeData = BaseNodeData<ExecPostgresForm> & {
  type: 'execpostgres';
};
export type NativeKeywordsNodeData = BaseNodeData<NativeKeywordsForm> & {
  type: 'nativekeywords';
};
export type SendMailNodeData = BaseNodeData<SendMailForm> & {
  type: 'sendmail';
};
// (external) GoogleSearchNodeData, BingSearchNodeData, DuckGoSearchNodeData, WikipediaSearchNodeData
// GenerateNodeData / KeywordsNodeData / RewriteNodeData moved to package type files
export type HttpRequestNodeData = BaseNodeData<HttpRequestForm> & {
  type: 'httprequest';
};
export type TransformNodeData = BaseNodeData<TransformForm> & {
  type: 'transform';
};
export type FileReadNodeData = BaseNodeData<FileReadForm> & {
  type: 'fileread';
};
export type FileWriteNodeData = BaseNodeData<FileWriteForm> & {
  type: 'filewrite';
};
export type DelayNodeData = BaseNodeData<DelayForm> & {
  type: 'delay';
};
export type WebhookNodeData = BaseNodeData<WebhookForm> & {
  type: 'webhook';
};
export type JsonParseNodeData = BaseNodeData<JsonParseForm> & {
  type: 'jsonparse';
};
export type TextProcessNodeData = BaseNodeData<TextProcessForm> & {
  type: 'textprocess';
};
export type ValidateNodeData = BaseNodeData<ValidateForm> & {
  type: 'validate';
};
export type MathNodeData = BaseNodeData<MathForm> & {
  type: 'math';
};
export type DateTimeNodeData = BaseNodeData<DateTimeForm> & {
  type: 'datetime';
};
export type ConditionNodeData = BaseNodeData<ConditionForm> & {
  type: 'condition';
};
// (external) MattermostNodeData
// (external) SlackNodeData
// (external) JiraNodeData
// (external) GitLabNodeData
// (external) ConfluenceNodeData
// (external) GitHubNodeData
// (external) FacebookNodeData
// (external) GoogleMapNodeData
// (external) TwitterNodeData
// (external) InstagramNodeData
// (external) LinkedInNodeData
export type YouTubeNodeData = BaseNodeData<YouTubeForm> & {
  type: 'youtube';
};
export type TikTokNodeData = BaseNodeData<TikTokForm> & {
  type: 'tiktok';
};
// (external) DiscordNodeData
// (external) TelegramNodeData
// (external) WhatsAppNodeData
export type WeatherNodeData = BaseNodeData<WeatherForm> & {
  type: 'weather';
};

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

// Consolidate all node data types into a single union
export type NodeData =
  | (BaseNodeData<BeginForm> & { type: 'begin' })
  | (BaseNodeData<InterfaceForm> & { type: 'interface' })
  | (BaseNodeData<GenerateForm> & { type: 'generate' })
  | (BaseNodeData<CategorizeForm> & { type: 'categorize' })
  | (BaseNodeData<RetrievalForm> & { type: 'retrieval' })
  | (BaseNodeData<DecisionForm> & { type: 'decision' })
  | (BaseNodeData<KeywordsForm> & { type: 'keywords' })
  | (BaseNodeData<NativeKeywordsForm> & { type: 'nativekeywords' })
  | (BaseNodeData<ExecMysqlForm> & { type: 'execmysql' })
  | (BaseNodeData<ExecMssqlForm> & { type: 'execmssql' })
  | (BaseNodeData<ExecPostgresForm> & { type: 'execpostgres' })
  | (BaseNodeData<SubAgentForm> & { type: 'subagent' })
  | (BaseNodeData<AgentForm> & { type: 'agent' })
  | (BaseNodeData<AgentToolsForm> & { type: 'agenttools' })
  | (BaseNodeData<SendMailForm> & { type: 'sendmail' })
  | (BaseNodeData<GoogleSearchForm> & { type: 'googlesearch' })
  | (BaseNodeData<BingSearchForm> & { type: 'bingsearch' })
  | (BaseNodeData<DuckGoSearchForm> & { type: 'duckgosearch' })
  | (BaseNodeData<WikipediaSearchForm> & { type: 'wikipediasearch' })
  | (BaseNodeData<RewriteForm> & { type: 'rewrite' })
  | (BaseNodeData<HttpRequestForm> & { type: 'httprequest' })
  | (BaseNodeData<TransformForm> & { type: 'transform' })
  | (BaseNodeData<FileReadForm> & { type: 'fileread' })
  | (BaseNodeData<FileWriteForm> & { type: 'filewrite' })
  | (BaseNodeData<DelayForm> & { type: 'delay' })
  | (BaseNodeData<WebhookForm> & { type: 'webhook' })
  | (BaseNodeData<JsonParseForm> & { type: 'jsonparse' })
  | (BaseNodeData<TextProcessForm> & { type: 'textprocess' })
  | (BaseNodeData<ValidateForm> & { type: 'validate' })
  | (BaseNodeData<MathForm> & { type: 'math' })
  | (BaseNodeData<DateTimeForm> & { type: 'datetime' })
  | (BaseNodeData<ConditionForm> & { type: 'condition' })
  | MattermostNodeData
  | SlackNodeData
  | JiraNodeData
  | GitLabNodeData
  | ConfluenceNodeData
  | GitHubNodeData
  | FacebookNodeData
  | GoogleMapNodeData
  | TwitterNodeData
  | InstagramNodeData
  | LinkedInNodeData
  | (BaseNodeData<YouTubeForm> & { type: 'youtube' })
  | (BaseNodeData<TikTokForm> & { type: 'tiktok' })
  | DiscordNodeData
  | TelegramNodeData
  | WhatsAppNodeData
  | (BaseNodeData<WeatherForm> & { type: 'weather' })
  | (BaseNodeData<DisplayForm> & { type: 'display' })
  | (BaseNodeData<LoopForm> & { type: 'loop' })
  | (BaseNodeData<VariableForm> & { type: 'variable' })
  | (BaseNodeData<CodeForm> & { type: 'code' })
  | (BaseNodeData<TemplateForm> & { type: 'template' })
  | (BaseNodeData<CounterForm> & { type: 'counter' })
  | (BaseNodeData<CacheForm> & { type: 'cache' })
  | (BaseNodeData<LogForm> & { type: 'log' })
  | (BaseNodeData<FileAnalysisForm> & { type: 'fileanalysis' })
  | (BaseNodeData<CsvAnalysisForm> & { type: 'csvanalysis' })
  | (BaseNodeData<ImageAnalysisForm> & { type: 'imageanalysis' })
  | (BaseNodeData<PdfAnalysisForm> & { type: 'pdfanalysis' })
  | (BaseNodeData<LogAnalysisForm> & { type: 'loganalysis' })
  | (BaseNodeData<ExcelAnalysisForm> & { type: 'excelanalysis' })
  | (BaseNodeData<WeChatForm> & { type: 'wechat' });

// Helper type to extract specific node data
export type ExtractNodeData<T extends NodeTypeString> = Extract<NodeData, { type: T }>;

// Typed node instances
export type BeginNode = Node<BeginNodeData>;
export type InterfaceNode = Node<InterfaceNodeData>;
export type GenerateNode = Node<GenerateNodeData>;
export type CategorizeNode = Node<CategorizeNodeData>;
export type RetrievalNode = Node<RetrievalNodeData>;
export type DecisionNode = Node<DecisionNodeData>;
export type KeywordsNode = Node<KeywordsNodeData>;
export type ExecMysqlNode = Node<ExecMysqlNodeData>;
export type SubAgentNode = Node<SubAgentNodeData>;
export type AgentToolsNodeData = BaseNodeData<AgentToolsForm> & { type: 'agenttools' };
export type ExecMssqlNode = Node<ExecMssqlNodeData>;
export type ExecPostgresNode = Node<ExecPostgresNodeData>;
export type NativeKeywordsNode = Node<NativeKeywordsNodeData>;
export type SendMailNode = Node<SendMailNodeData>;
export type GoogleSearchNode = Node<GoogleSearchNodeData>;
export type BingSearchNode = Node<BingSearchNodeData>;
export type DuckGoSearchNode = Node<DuckGoSearchNodeData>;
export type WikipediaSearchNode = Node<WikipediaSearchNodeData>;
export type RewriteNode = Node<RewriteNodeData>;
export type HttpRequestNode = Node<HttpRequestNodeData>;
export type TransformNode = Node<TransformNodeData>;
export type FileReadNode = Node<FileReadNodeData>;
export type FileWriteNode = Node<FileWriteNodeData>;
export type DelayNode = Node<DelayNodeData>;
export type WebhookNode = Node<WebhookNodeData>;
export type JsonParseNode = Node<JsonParseNodeData>;
export type TextProcessNode = Node<TextProcessNodeData>;
export type ValidateNode = Node<ValidateNodeData>;
export type MathNode = Node<MathNodeData>;
export type DateTimeNode = Node<DateTimeNodeData>;
export type ConditionNode = Node<ConditionNodeData>;
export type MattermostNode = Node<MattermostNodeData>;
export type SlackNode = Node<SlackNodeData>;
export type JiraNode = Node<JiraNodeData>;
export type GitLabNode = Node<GitLabNodeData>;
export type ConfluenceNode = Node<ConfluenceNodeData>;
export type GitHubNode = Node<GitHubNodeData>;
export type FacebookNode = Node<FacebookNodeData>;
export type GoogleMapNode = Node<GoogleMapNodeData>;
export type TwitterNode = Node<TwitterNodeData>;
export type InstagramNode = Node<InstagramNodeData>;
export type LinkedInNode = Node<LinkedInNodeData>;
export type YouTubeNode = Node<YouTubeNodeData>;
export type TikTokNode = Node<TikTokNodeData>;
export type DiscordNode = Node<DiscordNodeData>;
export type TelegramNode = Node<TelegramNodeData>;
export type WhatsAppNode = Node<WhatsAppNodeData>;
export type WeatherNode = Node<WeatherNodeData>;
export type FileAnalysisNode = Node<FileAnalysisNodeData>;
export type CsvAnalysisNode = Node<CsvAnalysisNodeData>;
export type ImageAnalysisNode = Node<ImageAnalysisNodeData>;
export type PdfAnalysisNode = Node<PdfAnalysisNodeData>;
export type LogAnalysisNode = Node<LogAnalysisNodeData>;
export type ExcelAnalysisNode = Node<ExcelAnalysisNodeData>;
export type WeChatNode = Node<WeChatNodeData>;

// Union type for all flow nodes
export type FlowNode = Node<
  | BeginNodeData
  | InterfaceNodeData
  | GenerateNodeData
  | CategorizeNodeData
  | RetrievalNodeData
  | DecisionNodeData
  | KeywordsNodeData
  | NativeKeywordsNodeData
  | ExecMysqlNodeData
  | ExecMssqlNodeData
  | ExecPostgresNodeData
  | SubAgentNodeData
  | AgentNodeData
  | AgentToolsNodeData
  | SendMailNodeData
  | GoogleSearchNodeData
  | BingSearchNodeData
  | DuckGoSearchNodeData
  | WikipediaSearchNodeData
  | RewriteNodeData
  | HttpRequestNodeData
  | TransformNodeData
  | FileReadNodeData
  | FileWriteNodeData
  | DelayNodeData
  | WebhookNodeData
  | JsonParseNodeData
  | TextProcessNodeData
  | ValidateNodeData
  | MathNodeData
  | DateTimeNodeData
  | ConditionNodeData
  | MattermostNodeData
  | SlackNodeData
  | JiraNodeData
  | GitLabNodeData
  | ConfluenceNodeData
  | GitHubNodeData
  | FacebookNodeData
  | GoogleMapNodeData
  | TwitterNodeData
  | InstagramNodeData
  | LinkedInNodeData
  | YouTubeNodeData
  | TikTokNodeData
  | DiscordNodeData
  | TelegramNodeData
  | WhatsAppNodeData
  | WeatherNodeData
  | DisplayNodeData
  | LoopNodeData
  | VariableNodeData
  | CodeNodeData
  | TemplateNodeData
  | CounterNodeData
  | CacheNodeData
  | LogNodeData
  | FileAnalysisNodeData
  | CsvAnalysisNodeData
  | ImageAnalysisNodeData
  | PdfAnalysisNodeData
  | LogAnalysisNodeData
  | ExcelAnalysisNodeData
  | WeChatNodeData
>;

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

// (external) MattermostForm

// (external) SlackForm

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

// (external) GitLabForm

// (external) ConfluenceForm

// (external) JiraForm
// (external) GitHubForm

// (external) FacebookForm

// (external) GoogleMapForm

// (external) TwitterForm

// (external) TelegramForm

export interface YouTubeForm extends BaseForm {
  name: string;
  description?: string;
  action: 'upload_video' | 'get_videos' | 'get_channel_info' | 'create_playlist' | 'get_comments' | 'get_analytics';
  apiKey: string;
  videoFile?: string;
  title?: string;
  videoDescription?: string;
  tags?: string[];
  categoryId?: string;
  privacy?: 'public' | 'private' | 'unlisted';
  channelId?: string;
  videoId?: string;
  playlistTitle?: string;
}

export interface TikTokForm extends BaseForm {
  name: string;
  description?: string;
  action: 'upload_video' | 'get_user_info' | 'get_videos' | 'get_hashtag_videos';
  accessToken: string;
  videoFile?: string;
  caption?: string;
  hashtags?: string[];
  userId?: string;
  hashtag?: string;
  maxResults?: number;
  privacy?: 'public' | 'friends' | 'private';
}

// (external) DiscordForm
// (external) TelegramForm

// (external) WhatsAppForm
// (external) BingSearchForm, DuckGoSearchForm

export interface WeatherForm extends BaseForm {
  name: string;
  description?: string;
  action: 'current_weather' | 'forecast' | 'weather_alerts' | 'historical_weather';
  location: string;
  apiKey?: string;
  useSystemConfig?: boolean;
  units?: 'metric' | 'imperial' | 'kelvin';
  language?: string;
  days?: number; // For forecast
  includeHourly?: boolean;
  includeAlerts?: boolean;
}

export interface DisplayForm extends BaseForm {
  name: string;
  description?: string;
  outputFormat: 'text' | 'markdown' | 'html' | 'json';
  showAsModal?: boolean;
  content?: string;
}

export interface LoopForm extends BaseForm {
  name: string;
  description?: string;
  loopType: 'array' | 'object' | 'range';
  inputData: string;
  startIndex?: number;
  endIndex?: number;
  stepSize?: number;
  maxIterations: number;
  currentItemVariable: string;
  currentIndexVariable: string;
}

export interface VariableForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'set' | 'get' | 'delete' | 'append';
  variableName: string;
  variableValue?: string;
  defaultValue?: string;
}

export interface CodeForm extends BaseForm {
  name: string;
  description?: string;
  code: string;
  timeout: number;
  allowConsole: boolean;
}

export interface TemplateForm extends BaseForm {
  name: string;
  description?: string;
  templateEngine: 'handlebars' | 'mustache' | 'simple';
  templateContent: string;
  outputFormat: 'text' | 'html' | 'json';
}

export interface CounterForm extends BaseForm {
  name: string;
  description?: string;
  counterName: string;
  operation: 'increment' | 'decrement' | 'reset' | 'set';
  stepValue: number;
  initialValue: number;
  maxValue?: number;
  minValue?: number;
}

export interface CacheForm extends BaseForm {
  name: string;
  description?: string;
  operation: 'set' | 'get' | 'delete' | 'clear';
  cacheKey: string;
  cacheValue?: string;
  ttl: number;
  defaultValue?: string;
}

export interface LogForm extends BaseForm {
  name: string;
  description?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  includeData?: string;
  includeTimestamp: boolean;
  includeNodeInfo: boolean;
}

export interface FileAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  analysisType: 'metadata' | 'content' | 'structure' | 'security' | 'quality';
  fileTypes?: string[];
  includeHidden?: boolean;
  recursive?: boolean;
  outputFormat?: 'json' | 'csv' | 'xml' | 'text';
}

export interface CsvAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  operation: 'analyze' | 'validate' | 'transform' | 'filter' | 'aggregate';
  delimiter?: string;
  hasHeader?: boolean;
  encoding?: string;
  columns?: string[];
  filterCondition?: string;
  groupBy?: string;
  aggregateFunction?: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

export interface ImageAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  imagePath: string;
  analysisType: 'metadata' | 'dimensions' | 'colors' | 'text_recognition' | 'object_detection';
  ocrLanguage?: string;
  colorPalette?: number;
  outputDetails?: boolean;
}

export interface PdfAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  pdfPath: string;
  operation: 'extract_text' | 'extract_metadata' | 'extract_images' | 'split_pages' | 'merge_pdfs';
  pageRange?: string;
  outputDir?: string;
  preserveFormatting?: boolean;
  extractImages?: boolean;
}

export interface LogAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  logPath: string;
  logFormat: 'apache' | 'nginx' | 'json' | 'csv' | 'custom';
  customPattern?: string;
  analysisType: 'summary' | 'errors' | 'performance' | 'security' | 'trends';
  timeRange?: string;
  filterLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

export interface ExcelAnalysisForm extends BaseForm {
  name: string;
  description?: string;
  filePath: string;
  operation: 'read_sheets' | 'analyze_data' | 'pivot_table' | 'chart_data' | 'validate_formulas';
  sheetName?: string;
  cellRange?: string;
  includeFormulas?: boolean;
  skipEmptyRows?: boolean;
  dataTypes?: { [column: string]: 'string' | 'number' | 'date' | 'boolean' };
}

// Chinese platform form interfaces
export interface WeChatForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'send_template' | 'get_user_info' | 'create_menu' | 'get_qr_code' | 'send_mini_program';
  appId: string;
  appSecret: string;
  accessToken?: string;
  openId?: string;
  templateId?: string;
  message?: string;
  mediaId?: string;
  menuData?: string;
  scene?: string;
  miniProgramAppId?: string;
  miniProgramPath?: string;
}

// Add new node data types
export type FileAnalysisNodeData = BaseNodeData<FileAnalysisForm> & {
  type: 'fileanalysis';
};

export type CsvAnalysisNodeData = BaseNodeData<CsvAnalysisForm> & {
  type: 'csvanalysis';
};

export type ImageAnalysisNodeData = BaseNodeData<ImageAnalysisForm> & {
  type: 'imageanalysis';
};

export type PdfAnalysisNodeData = BaseNodeData<PdfAnalysisForm> & {
  type: 'pdfanalysis';
};

export type LogAnalysisNodeData = BaseNodeData<LogAnalysisForm> & {
  type: 'loganalysis';
};

export type ExcelAnalysisNodeData = BaseNodeData<ExcelAnalysisForm> & {
  type: 'excelanalysis';
};

export type DisplayNodeData = BaseNodeData<DisplayForm> & {
  type: 'display';
};

export type LoopNodeData = BaseNodeData<LoopForm> & {
  type: 'loop';
};

export type VariableNodeData = BaseNodeData<VariableForm> & {
  type: 'variable';
};

export type CodeNodeData = BaseNodeData<CodeForm> & {
  type: 'code';
};

export type TemplateNodeData = BaseNodeData<TemplateForm> & {
  type: 'template';
};

export type CounterNodeData = BaseNodeData<CounterForm> & {
  type: 'counter';
};

export type CacheNodeData = BaseNodeData<CacheForm> & {
  type: 'cache';
};

export type LogNodeData = BaseNodeData<LogForm> & {
  type: 'log';
};

export type WeChatNodeData = BaseNodeData<WeChatForm> & {
  type: 'wechat';
};

// Add typed node instances
export type DisplayNode = Node<DisplayNodeData>;
export type LoopNode = Node<LoopNodeData>;
export type VariableNode = Node<VariableNodeData>;
export type CodeNode = Node<CodeNodeData>;
export type TemplateNode = Node<TemplateNodeData>;
export type CounterNode = Node<CounterNodeData>;
export type CacheNode = Node<CacheNodeData>;
export type LogNode = Node<LogNodeData>;
