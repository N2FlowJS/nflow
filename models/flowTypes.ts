import { Edge, Node } from '@xyflow/react';
import React from 'react';

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
  subagent: 'subagent',
  sendmail: 'sendmail',
  googlesearch: 'googlesearch',
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
} as const;
export type NodeTypeString = keyof typeof NODE_TYPES;

// Input/Output reference system - simplified for specific node types
export interface InputReference {
  sourceNodeId: string;
  id: string;
}

// Generic Base Node Data with form type parameter
export type BaseNodeData<TForm = unknown> = {
  label: string;
  id: string;
  position: { x: number; y: number };
  type: NodeTypeString;
  [key: string]: unknown;
  form: TForm;
  _lastUpdate?: number; // Add timestamp field for forcing re-renders
};

export interface BaseForm {
  name: string; // This field is essential for display and node identification
  description?: string; // Make these optional since not all nodes need them
  output?: string;
  role?: 'developer' | 'assistant' | 'system' | 'user';
  inputRefs?: InputReference[]; // Add support for input references
}

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

export interface GenerateForm extends BaseForm {
  prompt: string;
  numberHistory: number;
  model: string;
}
export interface KeywordsForm extends BaseForm {
  model: string;
  prompt: string;
  maxResults: number;
  numberHistory: number;
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

export interface ExecMysqlForm  extends BaseForm {
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

export interface GoogleSearchForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  maxResults?: number;
  safeSearch?: 'off' | 'moderate' | 'strict';
  language?: string;
  country?: string;
  apiKey?: string;
  searchEngineId?: string;
  useSystemConfig?: boolean;
}

export interface WikipediaSearchForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  maxResults?: number;
  language?: string;
  summaryOnly?: boolean;
}

export interface RewriteForm extends BaseForm {
  name: string;
  description?: string;
  model: string;
  prompt: string;
  numberHistory: number;
  preserveMeaning?: boolean;
  outputStyle?: 'formal' | 'casual' | 'professional' | 'concise' | 'detailed';
}

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

export type InterfaceNodeData = BaseNodeData<InterfaceForm> & {
  type: 'interface';
};

export type GenerateNodeData = BaseNodeData<GenerateForm> & {
  type: 'generate';
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
export type KeywordsNodeData = BaseNodeData<KeywordsForm> & {
  type: 'keywords';
};

export type ExecMysqlNodeData = BaseNodeData<ExecMysqlForm> & {
  type: 'execmysql';
};
export type SubAgentNodeData = BaseNodeData<SubAgentForm> & {
  type: 'subagent';
};
export type ExecMssqlNodeData = BaseNodeData<ExecMssqlForm> & {
  type: 'execmssql';
};
export type SendMailNodeData = BaseNodeData<SendMailForm> & {
  type: 'sendmail';
};
export type GoogleSearchNodeData = BaseNodeData<GoogleSearchForm> & {
  type: 'googlesearch';
};
export type WikipediaSearchNodeData = BaseNodeData<WikipediaSearchForm> & {
  type: 'wikipediasearch';
};
export type RewriteNodeData = BaseNodeData<RewriteForm> & {
  type: 'rewrite';
};
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
export type MattermostNodeData = BaseNodeData<MattermostForm> & {
  type: 'mattermost';
};
export type SlackNodeData = BaseNodeData<SlackForm> & {
  type: 'slack';
};
export type JiraNodeData = BaseNodeData<JiraForm> & {
  type: 'jira';
};
export type GitLabNodeData = BaseNodeData<GitLabForm> & {
  type: 'gitlab';
};
export type ConfluenceNodeData = BaseNodeData<ConfluenceForm> & {
  type: 'confluence';
};
export type GitHubNodeData = BaseNodeData<GitHubForm> & {
  type: 'github';
};
export type FacebookNodeData = BaseNodeData<FacebookForm> & {
  type: 'facebook';
};
export type GoogleMapNodeData = BaseNodeData<GoogleMapForm> & {
  type: 'googlemap';
};
export type TwitterNodeData = BaseNodeData<TwitterForm> & {
  type: 'twitter';
};
export type InstagramNodeData = BaseNodeData<InstagramForm> & {
  type: 'instagram';
};
export type LinkedInNodeData = BaseNodeData<LinkedInForm> & {
  type: 'linkedin';
};
export type YouTubeNodeData = BaseNodeData<YouTubeForm> & {
  type: 'youtube';
};
export type TikTokNodeData = BaseNodeData<TikTokForm> & {
  type: 'tiktok';
};
export type DiscordNodeData = BaseNodeData<DiscordForm> & {
  type: 'discord';
};
export type TelegramNodeData = BaseNodeData<TelegramForm> & {
  type: 'telegram';
};
export type WhatsAppNodeData = BaseNodeData<WhatsAppForm> & {
  type: 'whatsapp';
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

// Union type for all node data
export type NodeData =
  | BeginNodeData
  | InterfaceNodeData
  | GenerateNodeData
  | CategorizeNodeData
  | RetrievalNodeData
  | DecisionNodeData
  | KeywordsNodeData
  | ExecMysqlNodeData
  | ExecMssqlNodeData
  | SubAgentNodeData
  | SendMailNodeData
  | GoogleSearchNodeData
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
  | WhatsAppNodeData;

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
export type ExecMssqlNode = Node<ExecMssqlNodeData>;
export type SendMailNode = Node<SendMailNodeData>;
export type GoogleSearchNode = Node<GoogleSearchNodeData>;
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

// Union type for all flow nodes
export type FlowNode = Node<
  | BeginNodeData
  | InterfaceNodeData
  | GenerateNodeData
  | CategorizeNodeData
  | RetrievalNodeData
  | DecisionNodeData
  | KeywordsNodeData
  | ExecMysqlNodeData
  | ExecMssqlNodeData
  | SubAgentNodeData
  | SendMailNodeData
  | GoogleSearchNodeData
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
  color: {
    background: string;
    border: string;
    handle: string;
  };
  input: string; // Description of what input the node accepts
  output: string; // Description of what output the node produces
  references?: InputReference[]; // Optional references for input/output
  data: Partial<NodeData>;
}

export interface MattermostForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'create_channel' | 'get_channels' | 'get_users';
  serverUrl: string;
  accessToken: string;
  channelId?: string;
  channelName?: string;
  message?: string;
  username?: string;
  teamId?: string;
}

export interface SlackForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'create_channel' | 'get_channels' | 'get_users' | 'upload_file';
  botToken: string;
  channelId?: string;
  channelName?: string;
  message?: string;
  username?: string;
  filePath?: string;
  fileName?: string;
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

export interface GitLabForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_issue' | 'create_merge_request' | 'get_project' | 'get_issues' | 'create_comment';
  serverUrl: string;
  accessToken: string;
  projectId?: string;
  title?: string;
  issueIid?: string;
  sourceBranch?: string;
  targetBranch?: string;
  assigneeId?: string;
  labels?: string[];
  comment?: string;
}

export interface ConfluenceForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_page' | 'update_page' | 'get_page' | 'search_pages' | 'add_comment' | 'get_spaces';
  serverUrl: string;
  username: string;
  apiToken: string;
  spaceKey?: string;
  pageId?: string;
  parentPageId?: string;
  title?: string;
  content?: string;
  searchQuery?: string;
  comment?: string;
}

export interface GitHubForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_issue' | 'create_pull_request' | 'get_repository' | 'get_issues' | 'add_comment' | 'get_pull_requests' | 'merge_pull_request';
  token: string;
  owner: string;
  repository: string;
  issueNumber?: string;
  pullNumber?: string;
  title?: string;
  body?: string;
  head?: string;
  base?: string;
  comment?: string;
  labels?: string[];
  assignees?: string[];
}

export interface FacebookForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_post' | 'get_page_info' | 'get_posts' | 'create_comment' | 'get_page_insights' | 'upload_photo';
  accessToken: string;
  pageId?: string;
  postId?: string;
  message?: string;
  photoUrl?: string;
  comment?: string;
  link?: string;
  scheduled?: boolean;
  scheduledTime?: string;
}

export interface GoogleMapForm extends BaseForm {
  name: string;
  description?: string;
  action: 'geocode' | 'reverse_geocode' | 'directions' | 'places_search' | 'place_details' | 'distance_matrix';
  apiKey: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  origin?: string;
  destination?: string;
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  query?: string;
  placeId?: string;
  radius?: number;
  type?: string;
}

export interface TwitterForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_tweet' | 'get_tweets' | 'get_user_info' | 'follow_user' | 'like_tweet' | 'retweet' | 'get_mentions';
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  tweetText?: string;
  userId?: string;
  username?: string;
  tweetId?: string;
  query?: string;
  maxResults?: number;
}

export interface InstagramForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_post' | 'get_posts' | 'get_user_info' | 'get_media' | 'create_story' | 'get_insights';
  accessToken: string;
  userId?: string;
  mediaUrl?: string;
  caption?: string;
  mediaType?: 'image' | 'video' | 'carousel';
  storyMediaUrl?: string;
}

export interface LinkedInForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_post' | 'get_profile' | 'get_company_info' | 'create_article' | 'get_connections';
  accessToken: string;
  personId?: string;
  companyId?: string;
  postText?: string;
  articleTitle?: string;
  articleContent?: string;
  mediaUrl?: string;
  visibility?: 'public' | 'connections';
}

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

export interface DiscordForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'create_channel' | 'get_messages' | 'send_embed' | 'manage_roles' | 'get_guild_info';
  botToken: string;
  channelId?: string;
  guildId?: string;
  message?: string;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
  userId?: string;
  roleId?: string;
}

export interface TelegramForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'send_photo' | 'send_document' | 'get_updates' | 'create_poll' | 'send_location';
  botToken: string;
  chatId?: string;
  message?: string;
  photoUrl?: string;
  documentUrl?: string;
  pollQuestion?: string;
  pollOptions?: string[];
  latitude?: string;
  longitude?: string;
  parseMode?: 'Markdown' | 'HTML';
}

export interface WhatsAppForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'send_media' | 'send_template' | 'get_media' | 'mark_read';
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  message?: string;
  mediaId?: string;
  mediaUrl?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}
