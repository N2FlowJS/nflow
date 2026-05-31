import type { Node, Edge } from '@xyflow/react';

/**
 * Shared Node Data structure for both Frontend and Backend
 */
export type NodeData = {
  label: string;
  type: string;
  description?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'cancelled';
  errorMessage?: string;
  lastInput?: any;
  lastOutput?: any;
  params?: Record<string, any>;
  configSchema?: {
    label: string;
    name: string;
    type: 'text' | 'password' | 'number' | 'select' | 'textarea' | 'boolean';
    options?: string[];
    value?: string | number | boolean;
    hidden?: boolean;
  }[];
  [key: string]: any;
};

export type PortDataType =
  | 'text'
  | 'chat_model'
  | 'embedding_model'
  | 'tool'
  | 'boolean_route'
  | 'any';

export interface HandleConfig {
  id?: string;
  portType: PortDataType;
  position: 'left' | 'right' | 'top' | 'bottom';
  offsetPercent?: number;
  borderClass?: string;
  hoverBorderClass?: string;
  labelText?: string;
  labelClassName?: string;
  badgeParamKey?: string;
  badgeFallback?: PortDataType;
  badgeClassName?: string;
  shouldShow?: (data: any) => boolean;
}

export type GlobalVariable = {
  id: string;
  name: string;
  value: string;
};

export type CustomNodeType = Node<NodeData>;
export type CustomEdgeType = Edge;

/**
 * Standard Flow Storage Format
 */
export interface FlowData {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  viewport?: { x: number; y: number; zoom: number };
  globalVariables?: GlobalVariable[];
}

export interface FlowVersion {
  id: string;
  timestamp: number;
  data: FlowData;
  label?: string;
}

export interface SavedFlow {
  id: string;
  name: string;
  data?: FlowData;
  versions?: FlowVersion[];
  updatedAt: number;
  userId?: string;
}

/**
 * Unified API Response Structure
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

/**
 * Validation Types
 */
export type ValidationLevel = 'error' | 'warning';
export type ValidationLocale = 'en' | 'vi';

export interface FlowValidationIssue {
  level: ValidationLevel;
  nodeId?: string;
  fieldName?: string;
  message: string;
}

export type ValidationContext = {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
};

export type NodeValidationRuleKey =
  | 'agent-llm-link'
  | 'prompt-template-not-empty'
  | 'mssql-required'
  | 'elasticsearch-endpoint-required'
  | 'gitlab-required'
  | 'http-url-required'
  | 'code-required'
  | 'condition-required'
  | 'serper-api-key-required'
  | 'github-required';

export type NodeValidationRuleConfig = {
  key: NodeValidationRuleKey;
  level?: ValidationLevel;
  message?: string;
  messageEn?: string;
  messageVi?: string;
};

/**
 * Execution Events
 */
export type FlowRuntimeEventType =
  | 'flow_start'
  | 'flow_end'
  | 'node_start'
  | 'node_end'
  | 'node_error'
  | 'log'
  | 'checkpoint';

export interface FlowRuntimeEvent {
  type: FlowRuntimeEventType;
  timestamp: number;
  nodeId?: string;
  nodeLabel?: string;
  data?: any;
  message?: string;
  executionId?: string;
}

/**
 * Chat history message structure
 */
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  text: string;
};

/**
 * Regular expression for placeholders like {{variable}}
 */
export const PLACEHOLDER_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * Common Logic for Placeholder Validation (Server & Client)
 */
export const validatePlaceholdersInString = (
  value: string, 
  availableNames: Set<string>,
  checkEnv = false
): string | null => {
  const matches = value.matchAll(PLACEHOLDER_REGEX);

  for (const match of matches) {
    const placeholderName = String(match[1] || '').trim();
    if (!placeholderName) continue;

    const exists = availableNames.has(placeholderName);
    if (!exists) {
      if (checkEnv) {
         // This check is specific to server environment
         // We use any type to avoid global process type issues in pure TS
         const env = (typeof process !== 'undefined' ? process.env : {}) as any;
         if (env[placeholderName] !== undefined) continue;
      }
      return `Placeholder "{{${placeholderName}}}" could not be resolved`;
    }
  }
  return null;
};

export const Utils = {
  /** Mask a sensitive string (API Key, Secret) */
  maskString: (v: string | unknown) => {
    const s = String(v || '').trim();
    if (!s) return '';
    if (s.length <= 8) return `${s.slice(0, 2)}***`;
    return `${s.slice(0, 4)}***${s.slice(-4)}`;
  },

  /** Normalize API key - trim and remove Bearer */
  normalizeApiKey: (apiKey: string | unknown) => {
    const raw = String(apiKey || '').trim();
    return raw.replace(/^Bearer\s+/i, '').trim();
  },

  /** Prettify component type names */
  prettifyLabel: (typeName: string) => {
    if (!typeName) return '';
    const withoutComp = typeName.replace(/Component$/, '').replace(/_/g, ' ');
    const spaced = withoutComp.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    return spaced.replace(/\b([a-z])/g, (s: string) => s.toUpperCase());
  },

  /** Generate a unique execution ID */
  generateId: (prefix: string = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  },

  /** Race a promise against a timeout */
  withTimeout: <T>(operation: Promise<T>, ms: number, message: string): Promise<T> =>
    Promise.race([
      operation,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
    ]),

  /** Extract a clean error message string from any caught value. */
  toErrorMessage: (err: unknown, fallback = 'An unexpected error occurred'): string => {
    if (!err) return '';
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    try {
      const stringified = JSON.stringify(err);
      if (stringified.includes('{"error"')) {
         const payload = JSON.parse(stringified);
         return payload.error?.message || payload.error || stringified;
      }
      return stringified;
    } catch {
      return String(err) || fallback;
    }
  },

  /** Check if a string looks like a secret or API key */
  looksLikeSecret: (v: string | unknown): boolean => {
    const s = String(v || '').trim();
    if (!s) return false;
    // Standard secret patterns (NVIDIA, OpenAI, Github, Gitlab, Google Cloud)
    const isKey = /^(?:Bearer\s+)?(?:nvapi-|sk-|pk-|ghp_|glpat-|AIza|xoxb-|ya29\.)/i.test(s);
    return isKey || s.length >= 32;
  }
};

/**
 * Shared Validation Rules (Pure functions)
 */
export const ValidationRules = {
  /** Check if Agent node has LLM connected */
  validateAgentNode: (node: any, context: { edges: any[] }): FlowValidationIssue[] => {
    const hasLlm = context.edges.some(
      (e) => e.target === node.id && (e.targetHandle === 'agent_llm' || e.targetHandle?.includes('llm')),
    );
    if (hasLlm) return [];

    return [
      {
        level: 'error',
        nodeId: node.id,
        message: `Agent "${node.data.label}" is missing Chat Model connection.`,
      },
    ];
  },

  /** Check if mandatory parameters are filled */
  validateRequiredParams: (node: any, paramKeys: string[]): FlowValidationIssue[] => {
    const issues: FlowValidationIssue[] = [];
    const params = node.data?.params || {};
    
    for (const key of paramKeys) {
      const val = params[key];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        issues.push({
          level: 'error',
          nodeId: node.id,
          fieldName: key,
          message: `Parameter "${key}" is required for ${node.data.label}.`,
        });
      }
    }
    return issues;
  },

  /** Check if a specific parameter is filled */
  validateSingleParam: (node: any, paramKey: string, level: ValidationLevel = 'error', message?: string): FlowValidationIssue[] => {
    const val = node.data?.params?.[paramKey];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      return [{
        level,
        nodeId: node.id,
        fieldName: paramKey,
        message: message || `Parameter "${paramKey}" is required for ${node.data.label}.`,
      }];
    }
    return [];
  }
};

