import { Node, Edge } from '@xyflow/react';
import type { NodeData } from '@n2flow/types';
import {
  AGENT_TEMPLATE_OPTIONS,
  DEFAULT_AGENT_INSTRUCTION,
  DEFAULT_AGENT_TEMPLATE,
} from '../back-end/agent-templates';

export const initialNodes: Node<NodeData>[] = [
  {
    id: "Agent-zYJXW",
    type: "cyberNode",
    position: { x: 600, y: 300 }, 
    data: {
      label: "Agent Core",
      type: "Agent",
      description: "Brain of the operation. Orchestrates tools and LLM responses.",
      status: "idle",
      configSchema: [
        {
          label: 'Agent Template',
          name: 'agentTemplate',
          type: 'select',
          options: AGENT_TEMPLATE_OPTIONS,
          value: DEFAULT_AGENT_TEMPLATE,
        },
        { label: 'System Instruction', name: 'instruction', type: 'textarea', value: DEFAULT_AGENT_INSTRUCTION }
      ]
    }
  },
  {
    id: "LanguageModelComponent-AGUsx",
    type: "cyberNode",
    position: { x: 615, y: -50 },
    data: {
      label: "vLLM Model",
      type: "LanguageModelComponent",
      description: "Primary LLM provider configuration.",
      status: "idle",
      configSchema: [
        { label: 'Model Type', name: 'modelType', type: 'select', options: ['Chat', 'Embedding'], value: 'Chat' },
        { label: 'Provider', name: 'provider', type: 'select', options: ['Google', 'OpenAI', 'Anthropic'] },
        { label: 'Model Version', name: 'model', type: 'text', value: 'gemini-3-flash-preview' }
      ]
    }
  },
  {
    id: "MSSQLPyODBCComponent-8WC7c",
    type: "cyberNode",
    position: { x: 350, y: 650 },
    data: {
      label: "SQL Server",
      type: "MSSQLPyODBCComponent",
      description: "Database execution layer for QC records.",
      status: "idle",
      configSchema: [
        { label: 'Host', name: 'host', type: 'text' },
        { label: 'Query Template', name: 'query', type: 'textarea' }
      ]
    }
  },
  {
    id: "PromptTemplate-System",
    type: "cyberNode",
    position: { x: 200, y: 150 },
    data: {
      label: "System Prompt",
      type: "Prompt Template",
      description: "Instructions to guide the agent behavior.",
      status: "idle",
      configSchema: [
        { label: 'Prompt Template', name: 'template', type: 'textarea', value: "You are a QC Assistant. Current time: {time}" }
      ]
    }
  },
  {
    id: "CurrentTime-Node",
    type: "cyberNode",
    position: { x: -80, y: 150 },
    data: {
      label: "Time Stream",
      type: "CurrentTime",
      description: "Dynamic clock provider.",
      status: "idle"
    }
  },
  {
    id: "ChatInput-kXQ19",
    type: "cyberNode",
    position: { x: 200, y: 450 },
    data: {
      label: "User Input",
      type: "ChatInput",
      description: "Messages from Playground stream.",
      status: "idle"
    }
  },
  {
    id: "ChatOutput-JRYtT",
    type: "cyberNode",
    position: { x: 1050, y: 300 },
    data: {
      label: "Agent Output",
      type: "ChatOutput",
      description: "Interface with UI/UX display.",
      status: "idle"
    }
  }
];

export const initialEdges: Edge[] = [
  {
    id: "e-llm",
    source: "LanguageModelComponent-AGUsx",
    target: "Agent-zYJXW",
    targetHandle: "agent_llm",
    type: "cyberEdge",
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 }
  },
  {
    id: "e-sql",
    source: "MSSQLPyODBCComponent-8WC7c",
    target: "Agent-zYJXW",
    targetHandle: "tools",
    type: "cyberEdge",
    style: { stroke: '#f59e0b', strokeDasharray: '5,5' }
  },
  {
    id: "e-prompt",
    source: "PromptTemplate-System",
    target: "Agent-zYJXW",
    targetHandle: "system_prompt",
    type: "cyberEdge",
    style: { stroke: '#64748b', strokeWidth: 1.5 }
  },
  {
    id: "e-time",
    source: "CurrentTime-Node",
    target: "PromptTemplate-System",
    type: "cyberEdge",
    style: { stroke: '#64748b' }
  },
  {
    id: "e-input",
    source: "ChatInput-kXQ19",
    target: "Agent-zYJXW",
    targetHandle: "input_value",
    type: "cyberEdge",
    animated: true,
    style: { stroke: '#00ff9f', strokeWidth: 2 }
  },
  {
    id: "e-output",
    source: "Agent-zYJXW",
    target: "ChatOutput-JRYtT",
    sourceHandle: "response",
    type: "cyberEdge",
    animated: true,
    style: { stroke: '#00f0ff', strokeWidth: 2 }
  }
];