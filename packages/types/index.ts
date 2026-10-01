import type { Node, Edge } from '@xyflow/react';

/**
 * A single editable field on a node's config schema.
 */
export type ConfigSchemaField = {
  label: string;
  name: string;
  type: 'text' | 'password' | 'number' | 'select' | 'textarea' | 'boolean';
  options?: string[] | undefined;
  value?: string | number | boolean | undefined;
  hidden?: boolean | undefined;
};

/**
 * Shared Node Data structure for both Frontend and Backend
 */
export type NodeData = {
  label: string;
  type: string;
  description?: string | undefined;
  status?: 'idle' | 'running' | 'success' | 'error' | 'cancelled' | undefined;
  errorMessage?: string | undefined;
  lastInput?: unknown;
  lastOutput?: unknown;
  params?: Record<string, unknown> | undefined;
  configSchema?: ConfigSchemaField[] | undefined;
  /** Frontend-only: a `cyberGroup` node's collapsed state. */
  isCollapsed?: boolean | undefined;
};

export type PortDataType =
  | 'text'
  | 'chat_model'
  | 'embedding_model'
  | 'tool'
  | 'boolean_route'
  | 'any';

export type NodeFieldValue = string | number | boolean;

/** Anything that can supply a node's configured field values. */
export type NodeConfigSource = {
  configSchema?: ConfigSchemaField[] | undefined;
  params?: Record<string, unknown> | undefined;
};

export interface HandleConfig {
  id?: string | undefined;
  portType: PortDataType;
  position: 'left' | 'right' | 'top' | 'bottom';
  offsetPercent?: number | undefined;
  borderClass?: string | undefined;
  hoverBorderClass?: string | undefined;
  labelText?: string | undefined;
  labelClassName?: string | undefined;
  badgeParamKey?: string | undefined;
  badgeFallback?: PortDataType | undefined;
  badgeClassName?: string | undefined;
  shouldShow?: ((data: NodeConfigSource) => boolean) | undefined;
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
  data?: FlowData | undefined;
  versions?: FlowVersion[] | undefined;
  nodeCount?: number | undefined;
  edgeCount?: number | undefined;
  updatedAt: number;
  userId?: string | undefined;
}

/**
 * Unified API Response Structure
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T | undefined;
  error?: string | undefined;
  meta?: Record<string, unknown> | undefined;
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
  | 'nodeUpdate'
  | 'node_error'
  | 'log'
  | 'checkpoint'
  // Emitted over the execution SSE stream.
  | 'ping'
  | 'result'
  | 'llm_chunk'
  | 'error'
  | 'done';

export interface FlowRuntimeEvent {
  type: FlowRuntimeEventType;
  /** Added by the engine's `emit`; events forwarded by a node do not carry one. */
  timestamp?: number;
  nodeId?: string;
  nodeLabel?: string;
  data?: unknown;
  message?: string;
  executionId?: string;
  /** Incremental LLM output, carried by `llm_chunk`. */
  chunk?: string;
  /** Final flow output, carried by `result` / `done`. */
  output?: unknown;
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
  checkEnv = false,
): string | null => {
  const matches = value.matchAll(PLACEHOLDER_REGEX);

  for (const match of matches) {
    const placeholderName = String(match[1] || '').trim();
    if (!placeholderName) continue;

    const exists = availableNames.has(placeholderName);
    if (!exists) {
      if (checkEnv) {
        // Server-side only: a placeholder may also resolve from the environment.
        // Typed structurally so this package stays free of a Node type dependency.
        const env: Record<string, string | undefined> =
          typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};
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
  },
};

/**
 * Shared Validation Rules (Pure functions)
 */
export const ValidationRules = {
  /** Check if Agent node has LLM connected */
  validateAgentNode: (
    node: CustomNodeType,
    context: { edges: CustomEdgeType[] },
  ): FlowValidationIssue[] => {
    const hasLlm = context.edges.some(
      (e) =>
        e.target === node.id && (e.targetHandle === 'agent_llm' || e.targetHandle?.includes('llm')),
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
  validateRequiredParams: (node: CustomNodeType, paramKeys: string[]): FlowValidationIssue[] => {
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
  validateSingleParam: (
    node: CustomNodeType,
    paramKey: string,
    level: ValidationLevel = 'error',
    message?: string,
  ): FlowValidationIssue[] => {
    const val = node.data?.params?.[paramKey];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      return [
        {
          level,
          nodeId: node.id,
          fieldName: paramKey,
          message: message || `Parameter "${paramKey}" is required for ${node.data.label}.`,
        },
      ];
    }
    return [];
  },
};
