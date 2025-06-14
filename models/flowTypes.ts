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
  | ConditionNodeData;

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
