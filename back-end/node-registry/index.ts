// client UI types removed for backend build
import {
  AGENT_TEMPLATE_OPTIONS,
  DEFAULT_AGENT_INSTRUCTION,
  DEFAULT_AGENT_TEMPLATE,
} from "../agent-templates";
import type { FlowNode as CustomNodeType } from "../flowTypes";
import type { 
  NodeData, 
  PortDataType, 
  HandleConfig as NodeHandleConfig,
  NodeValidationRuleKey,
  NodeValidationRuleConfig
} from "@n2flow/types";

type ConfigSchema = NonNullable<NodeData["configSchema"]>;
export type NodeHandleContextData = {
  configSchema?: NodeData["configSchema"];
  params?: Record<string, unknown>;
  [key: string]: unknown;
};

type RegistryAwareNode = CustomNodeType & {
  data: CustomNodeType["data"] & {
    type: string;
  };
};

function isRegistryAwareNode(node: unknown): node is RegistryAwareNode {
  return (
    typeof node === "object" &&
    node !== null &&
    typeof (node as { data?: { type?: unknown } }).data?.type === "string"
  );
}

export type NodeInputHandleConfig = NodeHandleConfig;

export type NodeSourceHandleConfig = NodeHandleConfig;

type RegistryConfigField = ConfigSchema[number] & {
  inputHandles?: NodeInputHandleConfig[];
  sourceHandles?: NodeSourceHandleConfig[];
  hidden?: boolean;
};
type RegistryConfigSchema = RegistryConfigField[];

export type { NodeValidationRuleKey, NodeValidationRuleConfig };

export type NodeCategory =
  | "llm"
  | "tool"
  | "agent"
  | "input"
  | "output"
  | "template"
  | "logic"
  | "other";

type NodeRegistryEntry = {
  configSchema?: RegistryConfigSchema;
  validationRules?: Array<NodeValidationRuleKey | NodeValidationRuleConfig>;
  icon?: string;
  category?: NodeCategory;
};

type NodeFieldValues = Record<string, string | number | boolean>;

const PRIMARY_SOURCE_BADGE_RIGHT_CLASS =
  "-right-1.5 top-1/2 -translate-y-1/2 text-cyber-primary border-cyber-primary/60 bg-black/70";
const PRIMARY_SOURCE_BADGE_BOTTOM_CLASS =
  "left-1/2 -translate-x-1/2 -bottom-6 text-cyber-primary border-cyber-primary/60 bg-black/70";
const AS_TOOL_LABEL_CENTER_CLASS =
  "absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap";
const AS_TOOL_LABEL_75_CLASS =
  "absolute -top-6 left-3/4 -translate-x-1/2 flex flex-col items-center text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap";
const AS_TOOL_BADGE_CENTER_CLASS =
  "left-1/2 -translate-x-1/2 -top-6 text-amber-300 border-amber-500/60 bg-black/70";
const AS_TOOL_BADGE_75_CLASS =
  "left-[75%] -translate-x-1/2 -top-6 text-amber-300 border-amber-500/60 bg-black/70";


// --- Helpers ---
const createHandle = (
  type: "input" | "source",
  portType: NodeSourceHandleConfig["portType"],
  position: "left" | "right" | "top" | "bottom",
  extra: Partial<NodeSourceHandleConfig> = {}
): any => ({
  portType,
  position,
  ...(type === "source" ? {
    badgeParamKey: "output_type",
    badgeFallback: portType,
    badgeClassName: position === "bottom" ? PRIMARY_SOURCE_BADGE_BOTTOM_CLASS : PRIMARY_SOURCE_BADGE_RIGHT_CLASS,
  } : {}),
  ...extra,
});

const createPrimarySourceHandle = (
  portType: NodeSourceHandleConfig["portType"] = "text",
  position: "right" | "bottom" = "right",
) => createHandle("source", portType, position);

const createAsToolSourceHandle = (
  offsetPercent?: number,
): NodeSourceHandleConfig => createHandle("source", "tool", "top", {
  id: "as_tool",
  offsetPercent,
  borderClass: "!border-amber-500",
  hoverBorderClass: "hover:!border-amber-400 transition-colors",
  labelText: "AS_TOOL",
  labelClassName: offsetPercent === 75 ? AS_TOOL_LABEL_75_CLASS : AS_TOOL_LABEL_CENTER_CLASS,
  badgeParamKey: "as_tool_output_type",
  badgeFallback: "tool",
  badgeClassName: offsetPercent === 75 ? AS_TOOL_BADGE_75_CLASS : AS_TOOL_BADGE_CENTER_CLASS,
});

const commonModelFields = (sourceType: NodeSourceHandleConfig["portType"] = "chat_model"): RegistryConfigSchema => [
  { label: "Base URL (Optional)", name: "baseUrl", type: "text" },
  { label: "API Key (Optional)", name: "apiKey", type: "text" },
  {
    label: "Model Name",
    name: "model",
    type: "text",
    sourceHandles: [createPrimarySourceHandle(sourceType, "bottom")],
  },
  { label: "Temperature", name: "temperature", type: "number" },
  { label: "Max Tokens", name: "max_tokens", type: "number" },
  { label: "Top P", name: "top_p", type: "number" },
];

const chatModelFields = (extraFields: RegistryConfigField[] = []): RegistryConfigSchema => [
  {
    label: "Provider",
    name: "provider",
    type: "select",
    options: ["Google", "OpenAI", "Anthropic", "NVIDIA", "Ollama", "vLLM"],
    sourceHandles: [createPrimarySourceHandle("chat_model", "bottom")],
  },
  ...commonModelFields("chat_model").filter(f => f.name !== 'model'),
  {
    label: "Model Name",
    name: "model",
    type: "text",
  },
  ...extraFields,
  { label: "Stream", name: "stream", type: "boolean" },
];

// --- Schemas ---

const embeddingModelSchema: RegistryConfigSchema = [
  {
    label: "Provider",
    name: "provider",
    type: "select",
    options: ["Google", "OpenAI", "Ollama", "vLLM"],
    sourceHandles: [createPrimarySourceHandle("embedding_model", "bottom")],
  },
  { label: "Base URL (Optional)", name: "baseUrl", type: "text" },
  { label: "API Key (Optional)", name: "apiKey", type: "text" },
  {
    label: "Embedding Model",
    name: "model",
    type: "text",
  },
];

const promptTemplateSchema: RegistryConfigSchema = [
  {
    label: "Template",
    name: "template",
    type: "textarea",
    inputHandles: [createHandle("input", "text", "left")],
    sourceHandles: [createPrimarySourceHandle("text", "right")],
  },
];

const gitApiSchema = (p: 'GitLab' | 'GitHub'): RegistryConfigSchema => [
  {
    label: `${p} API Base URL`,
    name: "baseUrl",
    type: "text",
    sourceHandles: [createPrimarySourceHandle("text", "right"), createAsToolSourceHandle()],
  },
  { label: p === 'GitLab' ? "Project ID" : "Repository (owner/repo)", name: p === 'GitLab' ? "projectId" : "repoFullName", type: "text" },
  { label: p === 'GitLab' ? "Merge Request IID" : "Pull Request #", name: p === 'GitLab' ? "mergeRequestIid" : "pullRequestNumber", type: "text" },
  { label: p === 'GitLab' ? "Private Token" : "Access Token", name: p === 'GitLab' ? "privateToken" : "githubToken", type: "text" },
  {
    label: "Action",
    name: "action",
    type: "select",
    options: p === 'GitLab' ? ["get_changes", "get_notes", "get_discussions", "post_note"] : ["get_files", "get_comments", "post_comment"],
  },
  { label: "Content Template", name: "noteBody", type: "textarea" },
];

const gitLabMergeRequestSchema = gitApiSchema('GitLab');
const gitHubMergeRequestSchema = gitApiSchema('GitHub');

const nodeRegistry: Record<string, NodeRegistryEntry> = {
  
  ChatModelComponent: {
    category: "llm",
    icon: "BrainCircuit",
    configSchema: withDefaultValues(
      chatModelFields([
        { label: "Top K", name: "top_k", type: "number" },
        { label: "Presence Penalty", name: "presence_penalty", type: "number" },
        { label: "Frequency Penalty", name: "frequency_penalty", type: "number" },
      ]),
      {
        provider: "Google",
        model: "gemini-2.0-flash",
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0,
        stream: false,
        apiKey: "",
        baseUrl: "",
      },
    ),
  },

  MSSQLPyODBCComponent: {
    category: "tool",
    icon: "Database",
    configSchema: withDefaultValues(
      [
        {
          label: "Server Host",
          name: "server",
          type: "text",
          sourceHandles: [
            createPrimarySourceHandle("text", "right"),
            createAsToolSourceHandle(),
          ],
        },
        { label: "Port", name: "port", type: "number" },
        { label: "DB User", name: "user", type: "text" },
        { label: "DB Password", name: "password", type: "password" },
        { label: "Database", name: "database", type: "text" },
        { label: "Query Template", name: "query", type: "textarea" },
        {
          label: "Encrypt",
          name: "encrypt",
          type: "select",
          options: ["false", "true"],
        },
        {
          label: "Trust Server Cert",
          name: "trustServerCertificate",
          type: "select",
          options: ["true", "false"],
        },
        { label: "Timeout (ms)", name: "timeoutMs", type: "number" },
        { label: "Max Rows", name: "maxRows", type: "number" },
      ],
      {
        server: "",
        port: 1433,
        user: "",
        password: "",
        database: "",
        query: "SELECT TOP 20 * FROM YourTable WHERE name LIKE '%{query}%'",
        encrypt: "false",
        trustServerCertificate: "true",
        timeoutMs: 30000,
        maxRows: 200,
      },
    ),
    validationRules: ["mssql-required"],
  },
  GitLabMergeRequestComponent: {
    category: "tool",
    icon: "GitMerge",
    configSchema: withDefaultValues(gitLabMergeRequestSchema, {
      baseUrl: "https://gitlab.com/api/v4",
      projectId: "",
      mergeRequestIid: "",
      privateToken: "",
      action: "get_changes",
      noteBody: "Review from n2flow agent: {query}",
    }),
    validationRules: ["gitlab-required"],
  },
  GitHubMergeRequestComponent: {
    category: "tool",
    icon: "GitMerge",
    configSchema: withDefaultValues(gitHubMergeRequestSchema, {
      baseUrl: "https://api.github.com",
      repoFullName: "",
      pullRequestNumber: "",
      githubToken: "",
      action: "get_files",
      noteBody: "Review from n2flow agent: {query}",
    }),
    validationRules: ["github-required"],
  },
  EmbeddingModelComponent: {
    category: "llm",
    icon: "Cpu",
    configSchema: withDefaultValues(embeddingModelSchema, {
      provider: "Google",
      model: "text-embedding-004",
      apiKey: "",
      baseUrl: "",
    }),
  },
  "Prompt Template": {
    category: "template",
    icon: "Terminal",
    configSchema: withDefaultValues(promptTemplateSchema, {
      template: "Hello {name}",
    }),
    validationRules: [
      {
        key: "prompt-template-not-empty",
        level: "warning",
        messageEn: 'Prompt "{label}" is empty.',
        messageVi: 'Prompt "{label}" đang để trống.',
      },
    ],
  },
  Agent: {
    category: "agent",
    icon: "Bot",
    configSchema: withDefaultValues(
      [
        {
          label: "Agent Template",
          name: "agentTemplate",
          type: "select",
          options: AGENT_TEMPLATE_OPTIONS,
          inputHandles: [
            createHandle("input", "chat_model", "top", {
              id: "agent_llm",
              offsetPercent: 25,
              borderClass: "!border-purple-500",
            }),
            createHandle("input", "tool", "bottom", {
              id: "tools",
              borderClass: "!border-amber-500",
            }),
          ],
          sourceHandles: [createAsToolSourceHandle(75)],
        },
        {
          label: "System Instruction",
          name: "instruction",
          type: "textarea",
          inputHandles: [
            createHandle("input", "text", "left", {
              id: "system_prompt",
              offsetPercent: 28,
              borderClass: "!border-slate-500",
            }),
            createHandle("input", "text", "left", {
              id: "input_value",
              offsetPercent: 72,
              borderClass: "!border-green-500",
            }),
          ],
          sourceHandles: [
            createHandle("source", "text", "right", {
              id: "response",
              borderClass: "!border-cyan-500",
              badgeParamKey: "response_output_type",
              badgeClassName: "-right-1.5 top-1/2 -translate-y-1/2 text-cyan-300 border-cyan-500/60 bg-black/70",
              shouldShow: (data) => !String(getNodeFieldValue(data, "agentTemplate") || "").includes("Search"),
            }),
          ],
        },
        {
          label: "Stream Response",
          name: "stream",
          type: "boolean",
        },
      ],
      {
        agentTemplate: DEFAULT_AGENT_TEMPLATE,
        instruction: DEFAULT_AGENT_INSTRUCTION,
        stream: false,
      },
    ),
    validationRules: ["agent-llm-link"],
  },
  elasticsearch_search: {
    category: "tool",
    icon: "Search",
    configSchema: [
      {
        label: "Endpoint URL",
        name: "endpoint",
        type: "text",
        inputHandles: [
          createHandle("input", "embedding_model", "top", {
            id: "embedding_model",
            offsetPercent: 25,
            borderClass: "!border-blue-500",
            hoverBorderClass: "hover:!border-blue-400 transition-colors",
          }),
        ],
        sourceHandles: [createAsToolSourceHandle(75)],
      },
      {
        label: "Index Name",
        name: "index",
        type: "text",
        inputHandles: [createHandle("input", "text", "left")],
        sourceHandles: [createPrimarySourceHandle("text", "right")],
      },
      { label: "Vector Field", name: "vectorField", type: "text" },
      { label: "API Key (Optional)", name: "apiKey", type: "text" },
    ],
    validationRules: ["elasticsearch-endpoint-required"],
  },
  HTTPRequestComponent: {
    category: "tool",
    icon: "Globe",
    configSchema: [
      {
        label: "Method",
        name: "method",
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE"],
        sourceHandles: [
          createPrimarySourceHandle("text", "right"),
          createAsToolSourceHandle(),
        ],
      },
      { label: "URL", name: "url", type: "text" },
      { label: "Headers (JSON)", name: "headers", type: "textarea" },
    ],
    validationRules: [
      {
        key: "http-url-required",
        level: "error",
        messageEn: 'HTTP Request "{label}" missing {field}.',
        messageVi: 'HTTP Request "{label}" thiếu {field}.',
      },
    ],
  },
  ConditionComponent: {
    category: "logic",
    icon: "GitMerge",
    configSchema: [
      {
        label: "Condition (JS expression)",
        name: "condition",
        type: "text",
        inputHandles: [createHandle("input", "text", "left")],
        sourceHandles: [
          createHandle("source", "boolean_route", "right", {
            id: "true",
            offsetPercent: 25,
            borderClass: "!border-green-500",
            hoverBorderClass: "hover:!border-green-400 transition-colors",
            badgeClassName: "-right-1.5 top-[25%] -translate-y-1/2 text-green-300 border-green-500/60 bg-black/70",
          }),
          createHandle("source", "boolean_route", "right", {
            id: "false",
            offsetPercent: 75,
            borderClass: "!border-red-500",
            hoverBorderClass: "hover:!border-red-400 transition-colors",
            badgeClassName: "-right-1.5 top-[75%] -translate-y-1/2 text-red-300 border-red-500/60 bg-black/70",
          }),
          createAsToolSourceHandle(),
        ],
      },
    ],
    validationRules: [
      {
        key: "condition-required",
        level: "warning",
        messageEn: 'Condition "{label}" has empty {field}.',
        messageVi: 'Condition "{label}" có {field} trống.',
      },
    ],
  },
  CodeExecutionComponent: {
    category: "logic",
    icon: "Terminal",
    configSchema: [
      {
        label: "JavaScript Code",
        name: "code",
        type: "textarea",
        sourceHandles: [
          createPrimarySourceHandle("text", "right"),
          createAsToolSourceHandle(),
        ],
      },
    ],
    validationRules: [
      {
        key: "code-required",
        level: "warning",
        messageEn: 'JS Code "{label}" has empty {field}.',
        messageVi: 'JS Code "{label}" có {field} trống.',
      },
    ],
  },
  TextInput: {
    category: "input",
    icon: "Type",
    configSchema: [
      {
        label: "Value",
        name: "value",
        type: "textarea",
        inputHandles: [
          {
            portType: "text",
            position: "left",
          },
        ],
        sourceHandles: [
          createPrimarySourceHandle("text", "right"),
          createAsToolSourceHandle(),
        ],
      },
    ],
  },
  SerperSearchComponent: {
    category: "tool",
    icon: "Search",
    configSchema: withDefaultValues(
      [
        {
          label: "Serper API Key",
          name: "apiKey",
          type: "text",
          sourceHandles: [createAsToolSourceHandle()],
        },
        {
          label: "Search Query",
          name: "query",
          type: "text",
          inputHandles: [
            {
              portType: "text",
              position: "left",
            },
          ],
          sourceHandles: [createPrimarySourceHandle("text", "right")],
        },
      ],
      {
        apiKey: "",
        query: "{query}",
      },
    ),
    validationRules: ["serper-api-key-required"],
  },
  ImageGenerationComponent: {
    category: "tool",
    icon: "BrainCircuit",
    configSchema: withDefaultValues(
      [
        {
          label: "OpenAI API Key",
          name: "apiKey",
          type: "text",
          sourceHandles: [createAsToolSourceHandle()],
        },
        {
          label: "Prompt",
          name: "prompt",
          type: "textarea",
          inputHandles: [
            {
              portType: "text",
              position: "left",
            },
          ],
          sourceHandles: [createPrimarySourceHandle("text", "right")],
        },
        {
          label: "Model",
          name: "model",
          type: "select",
          options: ["dall-e-3", "dall-e-2"],
        },
        {
          label: "Size",
          name: "size",
          type: "select",
          options: ["1024x1024", "1024x1792", "1792x1024"],
        },
      ],
      {
        apiKey: "",
        model: "dall-e-3",
        size: "1024x1024",
      },
    ),
  },
  VariableComponent: {
    category: "other",
    icon: "Plus",
    configSchema: withDefaultValues(
      [
        {
          label: "Variable Name",
          name: "key",
          type: "text",
        },
        {
          label: "Constant Value",
          name: "value",
          type: "textarea",
          sourceHandles: [createPrimarySourceHandle("text", "right")],
        },
      ],
      {
        key: "VAR_1",
        value: "",
      },
    ),
  },
  FileSystemComponent: {
    category: "tool",
    icon: "FileJson",
    configSchema: withDefaultValues(
      [
        {
          label: "File Path",
          name: "path",
          type: "text",
          sourceHandles: [createAsToolSourceHandle()],
        },
        {
          label: "Action",
          name: "action",
          type: "select",
          options: ["Read", "Write", "Append"],
        },
        {
          label: "Content/Output",
          name: "content",
          type: "textarea",
          inputHandles: [
            {
              portType: "text",
              position: "left",
            },
          ],
          sourceHandles: [createPrimarySourceHandle("text", "right")],
        },
      ],
      {
        path: "./output.txt",
        action: "Read",
        content: "{query}",
      },
    ),
  },
  WaitComponent: {
    category: "logic",
    icon: "Clock",
    configSchema: withDefaultValues(
      [
        {
          label: "Delay (ms)",
          name: "delayMs",
          type: "number",
          inputHandles: [{ portType: "text", position: "left" }],
          sourceHandles: [createPrimarySourceHandle("text", "right")],
        },
      ],
      {
        delayMs: 1000,
      },
    ),
  },
  ChatInput: {
    category: "input",
    icon: "MessageSquare",
    configSchema: [
      {
        label: "System Prompt",
        name: "system_prompt",
        type: "textarea",
        sourceHandles: [createPrimarySourceHandle("text", "right")],
      },
    ],
  },
  ChatOutput: {
    category: "output",
    icon: "ArrowRightFromLine",
    configSchema: [
      {
        label: "Output Value",
        name: "output",
        type: "textarea",
        inputHandles: [{ portType: "text", position: "left" }],
      },
    ],
  },
  CurrentTime: {
    category: "other",
    icon: "Clock",
    configSchema: [
      {
        label: "Format",
        name: "format",
        type: "text",
        sourceHandles: [createPrimarySourceHandle("text", "right")],
      },
    ],
  },
};

const cloneConfigSchema = (schema?: ConfigSchema): ConfigSchema | undefined => {
  if (!schema) return undefined;
  return schema.map((field) => ({
    ...field,
    options: field.options ? [...field.options] : undefined,
    value: field.value,
    hidden: field.hidden,
  }));
};

function mergeSchemaWithParams(
  schema?: ConfigSchema,
  params?: NodeFieldValues,
): ConfigSchema | undefined {
  if (!schema) return undefined;
  return schema.map((field) => {
    const paramValue = params?.[field.name];
    // Prefer the stored user value over the registry default.
    // Only fall back to field.value (registry default) when paramValue is truly absent.
    return {
      ...field,
      value: paramValue !== undefined ? paramValue : field.value,
    };
  });
}

function withDefaultValues(
  schema: RegistryConfigSchema,
  values: NodeFieldValues,
): RegistryConfigSchema {
  return (
    (mergeSchemaWithParams(schema, values) as RegistryConfigSchema) || schema
  );
}

const ensureSchemaFieldValue = (
  schema: ConfigSchema | undefined,
  name: string,
  value: string | number | boolean,
): ConfigSchema => {
  const base = schema ? [...schema] : [];
  const index = base.findIndex((field) => field.name === name);
  if (index >= 0) {
    base[index] = { ...base[index], value };
    return base;
  }

  base.push({
    label: name,
    name,
    type: "text",
    value,
    hidden: true,
  });
  return base;
};

const ensureDynamicPortTypeFields = (
  schema?: ConfigSchema,
): ConfigSchema | undefined => {
  if (!schema || schema.length === 0) return schema;

  let next = [...schema];
  schema.forEach((field) => {
    ((field as RegistryConfigField).sourceHandles || []).forEach(
      (sourceHandle: NodeSourceHandleConfig) => {
        if (!sourceHandle.badgeParamKey || !sourceHandle.badgeFallback) return;
        const value = sourceHandle.badgeFallback;
        const existing = next.find(
          (schemaField) => schemaField.name === sourceHandle.badgeParamKey,
        );
        if (existing?.value !== undefined) return;
        next = ensureSchemaFieldValue(next, sourceHandle.badgeParamKey, value);
      },
    );
  });

  return next;
};

export const getNodeFieldValue = (
  data:
    | Pick<NodeData, "configSchema">
    | { configSchema?: NodeData["configSchema"]; params?: NodeFieldValues }
    | undefined,
  key: string,
): string | number | boolean | undefined => {
  if (!data) return undefined;
  const configValue = data.configSchema?.find(
    (field) => field.name === key,
  )?.value;
  if (configValue !== undefined) return configValue;
  return (data as { params?: NodeFieldValues }).params?.[key];
};

export const setNodeFieldValueInSchema = (
  schema: NodeData["configSchema"] | undefined,
  key: string,
  value: string | number | boolean,
): NodeData["configSchema"] | undefined => {
  if (!schema || schema.length === 0) {
    return [
      {
        label: key,
        name: key,
        type: "text",
        value,
        hidden: true,
      },
    ];
  }
  let updated = false;
  const next = schema.map((field) => {
    if (field.name !== key) return field;
    updated = true;
    return { ...field, value };
  });
  if (updated) return next;
  return [
    ...next,
    {
      label: key,
      name: key,
      type: "text",
      value,
      hidden: true,
    },
  ];
};

export const getNodeRegistryEntry = (
  nodeType: string,
): NodeRegistryEntry | undefined => nodeRegistry[nodeType];

export const getNodeValidationRuleKeys = (
  nodeType: string,
): NodeValidationRuleKey[] =>
  (nodeRegistry[nodeType]?.validationRules || []).map((rule) =>
    typeof rule === "string" ? rule : rule.key,
  );

export const getNodeValidationRuleConfigs = (
  nodeType: string,
): NodeValidationRuleConfig[] =>
  (nodeRegistry[nodeType]?.validationRules || []).map((rule) =>
    typeof rule === "string" ? { key: rule } : { ...rule },
  );

const getHandles = <T extends { shouldShow?: (data: NodeHandleContextData) => boolean }>(
  nodeType: string,
  key: 'inputHandles' | 'sourceHandles',
  data?: NodeHandleContextData,
): T[] => {
  const schema = nodeRegistry[nodeType]?.configSchema || [];
  return schema.flatMap((field) => {
    const handles = [...((field as any)[key] || [])] as T[];
    return !data ? handles : handles.filter((h) => !h.shouldShow || h.shouldShow(data));
  });
};

export const getNodeInputHandles = (
  nodeType: string,
  data?: NodeHandleContextData,
): NodeInputHandleConfig[] => getHandles<NodeInputHandleConfig>(nodeType, 'inputHandles', data);

export const getNodeSourceHandles = (
  nodeType: string,
  data?: NodeHandleContextData,
): NodeSourceHandleConfig[] => getHandles<NodeSourceHandleConfig>(nodeType, 'sourceHandles', data);

export const normalizeNodeWithRegistry = <T>(node: T): T => {
  if (!isRegistryAwareNode(node)) return node;

  const customNode = node;

  const entry = nodeRegistry[customNode.data.type];
  if (!entry) return node;

  const defaultSchema = cloneConfigSchema(entry.configSchema);
  const legacyParams =
    (customNode.data as unknown as { params?: NodeFieldValues }).params || {};
  const schemaValues = (
    customNode.data.configSchema || []
  ).reduce<NodeFieldValues>((acc, field) => {
    if (field.value !== undefined) {
      acc[field.name] = field.value;
    }
    return acc;
  }, {});
  const resolvedValues: NodeFieldValues = {
    ...legacyParams,
    ...schemaValues,
  };

  const hasVisibleSchema = !!customNode.data.configSchema?.some(
    (field) => !field.hidden,
  );
  const extraSchemaFields = (customNode.data.configSchema || []).filter(
    (field) =>
      !defaultSchema?.some((defaultField) => defaultField.name === field.name),
  );
  const mergedVisibleSchema = defaultSchema
    ? [...defaultSchema, ...extraSchemaFields]
    : customNode.data.configSchema;
  const baseSchema = hasVisibleSchema
    ? mergedVisibleSchema
    : defaultSchema;
  const resolvedSchema = mergeSchemaWithParams(baseSchema, resolvedValues);

  return {
    ...customNode,
    data: {
      ...customNode.data,
      configSchema: ensureDynamicPortTypeFields(resolvedSchema),
    },
  } as T;
};

export const createNodeDataByType = (
  nodeType: string,
  label: string,
): Pick<
  NodeData,
  "label" | "type" | "status" | "description" | "configSchema"
> => {
  const entry = nodeRegistry[nodeType];
  const defaultSchema = cloneConfigSchema(entry?.configSchema);

  return {
    label,
    type: nodeType,
    status: "idle",
    description: `New ${label} component initialized.`,
    configSchema: ensureDynamicPortTypeFields(defaultSchema),
  };
};

export default nodeRegistry;
