import type { Edge, Node } from '@xyflow/react';
import type { NodeData } from '../types';
import { normalizeNodeWithRegistry } from '../node-registry';

export type FlowTemplate = {
  id: string;
  name: string;
  description: string;
  data: {
    nodes: Node<NodeData>[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
};

type NodeValueMap = Record<string, string | number | boolean>;

const hiddenValueSchema = (values: NodeValueMap): NonNullable<NodeData['configSchema']> =>
  Object.entries(values).map(([name, value]) => ({
    label: name,
    name,
    type: 'text' as const,
    value,
    hidden: true,
  }));

const withValues = (
  schema: NonNullable<NodeData['configSchema']>,
  values: NodeValueMap,
): NonNullable<NodeData['configSchema']> => {
  const next = schema.map((field) => ({ ...field }));
  Object.entries(values).forEach(([name, value]) => {
    const index = next.findIndex((field) => field.name === name);
    if (index >= 0) {
      next[index] = { ...next[index], value };
      return;
    }
    next.push({
      label: name,
      name,
      type: 'text',
      value,
      hidden: true,
    });
  });
  return next;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const FLOW_TEMPLATES_RAW: FlowTemplate[] = [
  {
    id: 'assistant-basic',
    name: 'Assistant Basic',
    description: 'Basic assistant with chat input, model, prompt, and output.',
    data: {
      nodes: [
        {
          id: 'tmpl-chat-input',
          type: 'cyberNode',
          position: { x: 120, y: 320 },
          data: {
            label: 'Chat Input',
            type: 'ChatInput',
            status: 'idle',
            description: 'User message input.',
          },
        },
        {
          id: 'tmpl-chat-model',
          type: 'cyberNode',
          position: { x: 420, y: 60 },
          data: {
            label: 'vLLM Chat',
            type: 'VLLMChatModelComponent',
            status: 'idle',
            description: 'Chat model runtime.',
            configSchema: hiddenValueSchema({
              provider: 'vLLM',
              model: 'meta-llama/Meta-Llama-3-8B-Instruct',
              temperature: 0.7,
              apiKey: '',
              baseUrl: 'http://localhost:8000/v1',
            }),
          },
        },
        {
          id: 'tmpl-system-prompt',
          type: 'cyberNode',
          position: { x: 120, y: 100 },
          data: {
            label: 'Prompt',
            type: 'Prompt Template',
            status: 'idle',
            description: 'System behavior instruction.',
            configSchema: withValues([{ label: 'Template', name: 'template', type: 'textarea' }], {
              template: 'You are a helpful engineering assistant. Answer clearly and briefly.',
            }),
          },
        },
        {
          id: 'tmpl-agent',
          type: 'cyberNode',
          position: { x: 760, y: 250 },
          data: {
            label: 'Agent Core',
            type: 'Agent',
            status: 'idle',
            description: 'Core orchestration agent.',
            configSchema: withValues([
              {
                label: 'Agent Template',
                name: 'agentTemplate',
                type: 'select',
                options: ['General Assistant', 'Code Reviewer', 'GitLab MR Reviewer', 'Bug Triage', 'Data Analyst', 'Custom'],
              },
              { label: 'System Instruction', name: 'instruction', type: 'textarea' },
            ], {
              agentTemplate: 'General Assistant',
              instruction: 'You are a reliable AI assistant. Answer clearly and provide actionable guidance.',
            }),
          },
        },
        {
          id: 'tmpl-chat-output',
          type: 'cyberNode',
          position: { x: 1120, y: 250 },
          data: {
            label: 'Chat Output',
            type: 'ChatOutput',
            status: 'idle',
            description: 'Final response output.',
          },
        },
      ],
      edges: [
        {
          id: 'tmpl-e-llm',
          source: 'tmpl-chat-model',
          target: 'tmpl-agent',
          targetHandle: 'agent_llm',
          type: 'cyberEdge',
          label: 'CHAT_LLM',
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 1.5 },
        },
        {
          id: 'tmpl-e-input',
          source: 'tmpl-chat-input',
          target: 'tmpl-agent',
          targetHandle: 'input_value',
          type: 'cyberEdge',
          label: 'INPUT',
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 1.5 },
        },
        {
          id: 'tmpl-e-system',
          source: 'tmpl-system-prompt',
          target: 'tmpl-agent',
          targetHandle: 'system_prompt',
          type: 'cyberEdge',
          label: 'SYSTEM',
          style: { stroke: '#64748b', strokeWidth: 1.5 },
        },
        {
          id: 'tmpl-e-output',
          source: 'tmpl-agent',
          sourceHandle: 'response',
          target: 'tmpl-chat-output',
          type: 'cyberEdge',
          label: 'OUTPUT',
          animated: true,
          style: { stroke: '#22d3ee', strokeWidth: 1.5 },
        },
      ],
      viewport: { x: 0, y: 0, zoom: 0.85 },
    },
  },
  {
    id: 'gitlab-mr-code-review-agent',
    name: 'Agent - Review Code Merge',
    description: 'Full MR review flow: fetch changes, analyze code, and optionally post review note back to GitLab.',
    data: {
      nodes: [
        {
          id: 'tmpl3-chat-input',
          type: 'cyberNode',
          position: { x: 120, y: 280 },
          data: {
            label: 'Chat Input',
            type: 'ChatInput',
            status: 'idle',
            description: 'Prompt for MR review action.',
          },
        },
        {
          id: 'tmpl3-model',
          type: 'cyberNode',
          position: { x: 460, y: 60 },
          data: {
            label: 'vLLM Chat',
            type: 'VLLMChatModelComponent',
            status: 'idle',
            description: 'Reasoning model for review and summarization.',
            configSchema: hiddenValueSchema({
              provider: 'vLLM',
              model: 'meta-llama/Meta-Llama-3-8B-Instruct',
              temperature: 0.15,
              apiKey: '',
              baseUrl: 'http://localhost:8000/v1',
            }),
          },
        },
        {
          id: 'tmpl3-review-template',
          type: 'cyberNode',
          position: { x: 120, y: 60 },
          data: {
            label: 'MR Review Prompt',
            type: 'GitLabMRReviewTemplate',
            status: 'idle',
            description: 'Structured review instruction for merge request analysis.',
            configSchema: withValues([{ label: 'Template', name: 'template', type: 'textarea' }], {
              template:
                'You are a principal reviewer. For this GitLab merge request: 1) summarize intent, 2) identify blocking issues, 3) assess security/performance risks, 4) provide concrete fix suggestions. Use available GitLab tools before answering.',
            }),
          },
        },
        {
          id: 'tmpl3-comment-template',
          type: 'cyberNode',
          position: { x: 120, y: 500 },
          data: {
            label: 'MR Comment Prompt',
            type: 'GitLabMRCommentTemplate',
            status: 'idle',
            description: 'Template for posting concise MR note.',
            configSchema: withValues([{ label: 'Template', name: 'template', type: 'textarea' }], {
              template:
                'Create a concise GitLab MR note in Vietnamese with: Summary, Blocking Issues, Suggested Actions. Base on findings: {query}',
            }),
          },
        },
        {
          id: 'tmpl3-tool-changes',
          type: 'cyberNode',
          position: { x: 760, y: 500 },
          data: {
            label: 'GitLab MR Changes',
            type: 'GitLabMergeRequestComponent',
            status: 'idle',
            description: 'Tool to fetch merge request changes.',
            configSchema: hiddenValueSchema({
              baseUrl: 'https://gitlab.com/api/v4',
              projectId: '',
              mergeRequestIid: '',
              privateToken: '',
              action: 'get_changes',
              noteBody: 'Review from n2flow agent: {query}',
            }),
          },
        },
        {
          id: 'tmpl3-tool-note',
          type: 'cyberNode',
          position: { x: 1060, y: 500 },
          data: {
            label: 'GitLab MR Post Note',
            type: 'GitLabMergeRequestComponent',
            status: 'idle',
            description: 'Tool to post review note to merge request discussion.',
            configSchema: hiddenValueSchema({
              baseUrl: 'https://gitlab.com/api/v4',
              projectId: '',
              mergeRequestIid: '',
              privateToken: '',
              action: 'post_note',
              noteBody: '[n2flow] Review summary: {query}',
            }),
          },
        },
        {
          id: 'tmpl3-agent',
          type: 'cyberNode',
          position: { x: 760, y: 260 },
          data: {
            label: 'Agent Core',
            type: 'Agent',
            status: 'idle',
            description: 'Code merge review orchestration agent.',
            configSchema: withValues([
              {
                label: 'Agent Template',
                name: 'agentTemplate',
                type: 'select',
                options: ['General Assistant', 'Code Reviewer', 'GitLab MR Reviewer', 'Bug Triage', 'Data Analyst', 'Custom'],
              },
              { label: 'System Instruction', name: 'instruction', type: 'textarea' },
            ], {
              agentTemplate: 'GitLab MR Reviewer',
              instruction:
                'Review merge request code deeply. If critical findings exist, summarize clearly and suggest exact patches. Post note only when explicitly requested or when critical blockers are detected.',
            }),
          },
        },
        {
          id: 'tmpl3-output',
          type: 'cyberNode',
          position: { x: 1120, y: 260 },
          data: {
            label: 'Chat Output',
            type: 'ChatOutput',
            status: 'idle',
            description: 'Final review response to user.',
          },
        },
      ],
      edges: [
        {
          id: 'tmpl3-e-llm',
          source: 'tmpl3-model',
          target: 'tmpl3-agent',
          targetHandle: 'agent_llm',
          type: 'cyberEdge',
          label: 'CHAT_LLM',
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 1.5 },
        },
        {
          id: 'tmpl3-e-input',
          source: 'tmpl3-chat-input',
          target: 'tmpl3-agent',
          targetHandle: 'input_value',
          type: 'cyberEdge',
          label: 'INPUT',
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 1.5 },
        },
        {
          id: 'tmpl3-e-system',
          source: 'tmpl3-review-template',
          target: 'tmpl3-agent',
          targetHandle: 'system_prompt',
          type: 'cyberEdge',
          label: 'SYSTEM',
          style: { stroke: '#64748b', strokeWidth: 1.5 },
        },
        {
          id: 'tmpl3-e-tool-changes',
          source: 'tmpl3-tool-changes',
          sourceHandle: 'as_tool',
          target: 'tmpl3-agent',
          targetHandle: 'tools',
          type: 'cyberEdge',
          label: 'TOOL',
          style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'tmpl3-e-tool-note',
          source: 'tmpl3-tool-note',
          sourceHandle: 'as_tool',
          target: 'tmpl3-agent',
          targetHandle: 'tools',
          type: 'cyberEdge',
          label: 'TOOL',
          style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'tmpl3-e-output',
          source: 'tmpl3-agent',
          sourceHandle: 'response',
          target: 'tmpl3-output',
          type: 'cyberEdge',
          label: 'OUTPUT',
          animated: true,
          style: { stroke: '#22d3ee', strokeWidth: 1.5 },
        },
      ],
      viewport: { x: 0, y: 0, zoom: 0.72 },
    },
  },
  {
    id: 'sql-analyst-agent',
    name: 'SQL Analyst Agent',
    description: 'Analyze database questions via MSSQL tool and summarize results.',
    data: {
      nodes: [
        { id: 'tmpl4-input', type: 'cyberNode', position: { x: 120, y: 280 }, data: { label: 'Chat Input', type: 'ChatInput', status: 'idle' } },
        {
          id: 'tmpl4-model', type: 'cyberNode', position: { x: 420, y: 60 }, data: {
            label: 'vLLM Chat', type: 'VLLMChatModelComponent', status: 'idle',
            configSchema: hiddenValueSchema({ provider: 'vLLM', model: 'meta-llama/Meta-Llama-3-8B-Instruct', temperature: 0.2, apiKey: '', baseUrl: 'http://localhost:8000/v1' }),
          },
        },
        {
          id: 'tmpl4-prompt', type: 'cyberNode', position: { x: 120, y: 60 }, data: {
            label: 'SQL Analysis Prompt', type: 'Prompt Template', status: 'idle',
            configSchema: withValues([{ label: 'Template', name: 'template', type: 'textarea' }], { template: 'You are a SQL data analyst. Use SQL tool for factual data, then summarize key insights and anomalies.' }),
          },
        },
        {
          id: 'tmpl4-sql', type: 'cyberNode', position: { x: 760, y: 500 }, data: {
            label: 'MSSQL', type: 'MSSQLPyODBCComponent', status: 'idle',
            configSchema: hiddenValueSchema({
              server: '', port: 1433, user: '', password: '', database: '',
              query: "SELECT TOP 20 * FROM YourTable WHERE name LIKE '%{query}%'", encrypt: 'false',
              trustServerCertificate: 'true', timeoutMs: 30000, maxRows: 200,
            }),
          },
        },
        {
          id: 'tmpl4-agent', type: 'cyberNode', position: { x: 760, y: 260 }, data: {
            label: 'Agent Core', type: 'Agent', status: 'idle',
            configSchema: withValues([
              { label: 'Agent Template', name: 'agentTemplate', type: 'select', options: ['General Assistant', 'Code Reviewer', 'GitLab MR Reviewer', 'Bug Triage', 'Data Analyst', 'Custom'] },
              { label: 'System Instruction', name: 'instruction', type: 'textarea' },
            ], { agentTemplate: 'Data Analyst', instruction: 'Use SQL tool output as source of truth. Explain findings clearly and mention uncertainty if data is incomplete.' }),
          },
        },
        { id: 'tmpl4-output', type: 'cyberNode', position: { x: 1120, y: 260 }, data: { label: 'Chat Output', type: 'ChatOutput', status: 'idle' } },
      ],
      edges: [
        { id: 'tmpl4-e-llm', source: 'tmpl4-model', target: 'tmpl4-agent', targetHandle: 'agent_llm', type: 'cyberEdge', label: 'CHAT_LLM', animated: true, style: { stroke: '#a855f7', strokeWidth: 1.5 } },
        { id: 'tmpl4-e-input', source: 'tmpl4-input', target: 'tmpl4-agent', targetHandle: 'input_value', type: 'cyberEdge', label: 'INPUT', animated: true, style: { stroke: '#22c55e', strokeWidth: 1.5 } },
        { id: 'tmpl4-e-system', source: 'tmpl4-prompt', target: 'tmpl4-agent', targetHandle: 'system_prompt', type: 'cyberEdge', label: 'SYSTEM', style: { stroke: '#64748b', strokeWidth: 1.5 } },
        { id: 'tmpl4-e-tool', source: 'tmpl4-sql', sourceHandle: 'as_tool', target: 'tmpl4-agent', targetHandle: 'tools', type: 'cyberEdge', label: 'TOOL', style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5,5' } },
        { id: 'tmpl4-e-output', source: 'tmpl4-agent', sourceHandle: 'response', target: 'tmpl4-output', type: 'cyberEdge', label: 'OUTPUT', animated: true, style: { stroke: '#22d3ee', strokeWidth: 1.5 } },
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: 'elastic-rag-assistant',
    name: 'Elastic RAG Assistant',
    description: 'Q&A assistant with Elasticsearch semantic retrieval using embedding model.',
    data: {
      nodes: [
        { id: 'tmpl5-input', type: 'cyberNode', position: { x: 120, y: 280 }, data: { label: 'Chat Input', type: 'ChatInput', status: 'idle' } },
        {
          id: 'tmpl5-model', type: 'cyberNode', position: { x: 420, y: 60 }, data: {
            label: 'vLLM Chat', type: 'VLLMChatModelComponent', status: 'idle',
            configSchema: hiddenValueSchema({ provider: 'vLLM', model: 'meta-llama/Meta-Llama-3-8B-Instruct', temperature: 0.2, apiKey: '', baseUrl: 'http://localhost:8000/v1' }),
          },
        },
        {
          id: 'tmpl5-embedding', type: 'cyberNode', position: { x: 420, y: 500 }, data: {
            label: 'vLLM Embedding', type: 'VLLMEmbeddingModelComponent', status: 'idle',
            configSchema: hiddenValueSchema({ provider: 'vLLM', model: 'BAAI/bge-small-en-v1.5', apiKey: '', baseUrl: 'http://localhost:8000/v1' }),
          },
        },
        {
          id: 'tmpl5-prompt', type: 'cyberNode', position: { x: 120, y: 60 }, data: {
            label: 'RAG Prompt', type: 'Prompt Template', status: 'idle',
            configSchema: withValues([{ label: 'Template', name: 'template', type: 'textarea' }], { template: 'Answer strictly based on retrieved documents. If insufficient evidence, say not enough context.' }),
          },
        },
        {
          id: 'tmpl5-es', type: 'cyberNode', position: { x: 760, y: 500 }, data: {
            label: 'Elasticsearch', type: 'elasticsearch_search', status: 'idle',
            configSchema: hiddenValueSchema({ endpoint: '', index: '', vectorField: 'embedding', apiKey: '' }),
          },
        },
        {
          id: 'tmpl5-agent', type: 'cyberNode', position: { x: 760, y: 260 }, data: {
            label: 'Agent Core', type: 'Agent', status: 'idle',
            configSchema: withValues([
              { label: 'Agent Template', name: 'agentTemplate', type: 'select', options: ['General Assistant', 'Code Reviewer', 'GitLab MR Reviewer', 'Bug Triage', 'Data Analyst', 'Custom'] },
              { label: 'System Instruction', name: 'instruction', type: 'textarea' },
            ], { agentTemplate: 'General Assistant', instruction: 'Retrieve evidence from Elasticsearch tool first, then answer with citations-like bullet references from retrieved snippets.' }),
          },
        },
        { id: 'tmpl5-output', type: 'cyberNode', position: { x: 1120, y: 260 }, data: { label: 'Chat Output', type: 'ChatOutput', status: 'idle' } },
      ],
      edges: [
        { id: 'tmpl5-e-llm', source: 'tmpl5-model', target: 'tmpl5-agent', targetHandle: 'agent_llm', type: 'cyberEdge', label: 'CHAT_LLM', animated: true, style: { stroke: '#a855f7', strokeWidth: 1.5 } },
        { id: 'tmpl5-e-input', source: 'tmpl5-input', target: 'tmpl5-agent', targetHandle: 'input_value', type: 'cyberEdge', label: 'INPUT', animated: true, style: { stroke: '#22c55e', strokeWidth: 1.5 } },
        { id: 'tmpl5-e-system', source: 'tmpl5-prompt', target: 'tmpl5-agent', targetHandle: 'system_prompt', type: 'cyberEdge', label: 'SYSTEM', style: { stroke: '#64748b', strokeWidth: 1.5 } },
        { id: 'tmpl5-e-emb', source: 'tmpl5-embedding', target: 'tmpl5-es', targetHandle: 'embedding_model', type: 'cyberEdge', label: 'EMBEDDING', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
        { id: 'tmpl5-e-tool', source: 'tmpl5-es', sourceHandle: 'as_tool', target: 'tmpl5-agent', targetHandle: 'tools', type: 'cyberEdge', label: 'TOOL', style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5,5' } },
        { id: 'tmpl5-e-output', source: 'tmpl5-agent', sourceHandle: 'response', target: 'tmpl5-output', type: 'cyberEdge', label: 'OUTPUT', animated: true, style: { stroke: '#22d3ee', strokeWidth: 1.5 } },
      ],
      viewport: { x: 0, y: 0, zoom: 0.78 },
    },
  },
  {
    id: 'api-incident-investigator',
    name: 'API Incident Investigator',
    description: 'Investigate incidents by querying HTTP APIs and summarizing probable root cause and next actions.',
    data: {
      nodes: [
        { id: 'tmpl6-input', type: 'cyberNode', position: { x: 120, y: 280 }, data: { label: 'Chat Input', type: 'ChatInput', status: 'idle' } },
        {
          id: 'tmpl6-model', type: 'cyberNode', position: { x: 420, y: 60 }, data: {
            label: 'vLLM Chat', type: 'VLLMChatModelComponent', status: 'idle',
            configSchema: hiddenValueSchema({ provider: 'vLLM', model: 'meta-llama/Meta-Llama-3-8B-Instruct', temperature: 0.2, apiKey: '', baseUrl: 'http://localhost:8000/v1' }),
          },
        },
        {
          id: 'tmpl6-prompt', type: 'cyberNode', position: { x: 120, y: 60 }, data: {
            label: 'Incident Prompt', type: 'Prompt Template', status: 'idle',
            configSchema: withValues([{ label: 'Template', name: 'template', type: 'textarea' }], { template: 'You are an SRE assistant. Correlate API evidence, identify probable root cause, severity, and immediate mitigation steps.' }),
          },
        },
        {
          id: 'tmpl6-http', type: 'cyberNode', position: { x: 760, y: 500 }, data: {
            label: 'HTTP Request', type: 'HTTPRequestComponent', status: 'idle',
            configSchema: hiddenValueSchema({ method: 'GET', url: 'https://example.com/api/logs?q={query}' }),
          },
        },
        {
          id: 'tmpl6-agent', type: 'cyberNode', position: { x: 760, y: 260 }, data: {
            label: 'Agent Core', type: 'Agent', status: 'idle',
            configSchema: withValues([
              { label: 'Agent Template', name: 'agentTemplate', type: 'select', options: ['General Assistant', 'Code Reviewer', 'GitLab MR Reviewer', 'Bug Triage', 'Data Analyst', 'Custom'] },
              { label: 'System Instruction', name: 'instruction', type: 'textarea' },
            ], { agentTemplate: 'Bug Triage', instruction: 'Investigate incident reports, identify likely root cause, and propose practical mitigation + follow-up actions.' }),
          },
        },
        { id: 'tmpl6-output', type: 'cyberNode', position: { x: 1120, y: 260 }, data: { label: 'Chat Output', type: 'ChatOutput', status: 'idle' } },
      ],
      edges: [
        { id: 'tmpl6-e-llm', source: 'tmpl6-model', target: 'tmpl6-agent', targetHandle: 'agent_llm', type: 'cyberEdge', label: 'CHAT_LLM', animated: true, style: { stroke: '#a855f7', strokeWidth: 1.5 } },
        { id: 'tmpl6-e-input', source: 'tmpl6-input', target: 'tmpl6-agent', targetHandle: 'input_value', type: 'cyberEdge', label: 'INPUT', animated: true, style: { stroke: '#22c55e', strokeWidth: 1.5 } },
        { id: 'tmpl6-e-system', source: 'tmpl6-prompt', target: 'tmpl6-agent', targetHandle: 'system_prompt', type: 'cyberEdge', label: 'SYSTEM', style: { stroke: '#64748b', strokeWidth: 1.5 } },
        { id: 'tmpl6-e-tool', source: 'tmpl6-http', sourceHandle: 'as_tool', target: 'tmpl6-agent', targetHandle: 'tools', type: 'cyberEdge', label: 'TOOL', style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5,5' } },
        { id: 'tmpl6-e-output', source: 'tmpl6-agent', sourceHandle: 'response', target: 'tmpl6-output', type: 'cyberEdge', label: 'OUTPUT', animated: true, style: { stroke: '#22d3ee', strokeWidth: 1.5 } },
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
];

export const FLOW_TEMPLATES: FlowTemplate[] = FLOW_TEMPLATES_RAW.map((template) => ({
  ...template,
  data: {
    ...template.data,
    nodes: template.data.nodes.map((node) => ({
      ...(normalizeNodeWithRegistry({
        ...node,
        data: node.data,
      }) as Node<NodeData>),
    })),
  },
}));

export const createSavedFlowFromTemplate = (templateId: string) => {
  const template = FLOW_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return null;

  const now = Date.now();
  return {
    id: `flow-${now}`,
    name: template.name,
    data: clone(template.data),
    updatedAt: now,
  };
};
