export type AgentTool = {
  type: 'tool';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  nodeId: string;
  embeddingModel?: {
    kind: 'llm_embedding';
    provider?: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
  };
};

export type LlmRuntimeConfig = {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  temperature?: number | undefined;
  max_tokens?: number | undefined;
  top_p?: number | undefined;
  top_k?: number | undefined;
  presence_penalty?: number | undefined;
  frequency_penalty?: number | undefined;
  stream?: boolean | undefined;
};

export interface LlmProvider {
  name: string;
  listModels: (
    cfg: LlmRuntimeConfig,
  ) => Promise<Array<{ id: string; name?: string; description?: string }>>;
  runChat: (
    cfg: LlmRuntimeConfig,
    systemPrompt: string,
    userPrompt: string,
    availableTools: AgentTool[],
    executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
    log: (msg: string) => void,
    onStream?: (chunk: string) => void,
  ) => Promise<string>;
  embedText: (cfg: LlmRuntimeConfig, input: string) => Promise<number[]>;
}

export default {
  AgentTool: null as unknown,
  LlmRuntimeConfig: null as unknown,
};
