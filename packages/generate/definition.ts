/**
 * Generate (LLM) Node - NEW ARCHITECTURE
 * 
 * LLM text generation node with explicit input/output ports.
 * Migrated from legacy format to NodeDefinition format.
 * 
 * This node handles:
 * - Prompt processing with template variables
 * - Multi-provider LLM support (OpenAI, Gemini, etc.)
 * - Streaming responses
 * - History management
 */

import {
  NodeDefinition,
  NodeCategory,
} from '../@node-plugin/type';
import { GenerateExecutor } from './executor';
import { PortType } from '../@flow/ports/types';
import { GenerateForm } from './types';
import { getInputFromTemplate } from '../@template/template';

/**
 * Generate/LLM Node Definition
 * 
 * Sends prompts to language models and returns responses.
 * Supports multiple providers and streaming.
 */
export const GenerateNodeDefinition: NodeDefinition<GenerateForm> = {
  // Metadata
  id: 'generate',
  name: 'Generate (LLM)',
  category: NodeCategory.AI,
  description: 'Generate text using language models (OpenAI, Gemini, etc.)',
  version: '2.0.0',

  // Visual
  color: '#722ed1',
  tags: ['llm', 'ai', 'generate', 'openai', 'gemini'],

  // Configuration inputs
  inputs: [
    {
      id: 'prompt',
      name: 'Prompt',
      type: PortType.TEXT,
      description: 'The prompt template to send to the LLM. Use {variable} syntax for template variables.',
      required: true,
      defaultValue: '',
      metadata: {
        inputType: 'textarea',
        rows: 8,
        placeholder: 'Enter your prompt. Use {variable} for dynamic values.',
      },
    },
    {
      id: 'model',
      name: 'Model',
      type: PortType.TEXT,
      description: 'LLM model ID from database',
      required: true,
      defaultValue: '',
      metadata: {
        inputType: 'text',
        placeholder: 'Model ID',
      },
    },
    {
      id: 'systemPrompt',
      name: 'System Prompt',
      type: PortType.TEXT,
      description: 'System-level instructions for the LLM',
      required: false,
      defaultValue: '',
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'System instructions (optional)',
      },
    },
    {
      id: 'temperature',
      name: 'Temperature',
      type: PortType.NUMBER,
      description: 'Sampling temperature (0-2). Higher = more creative',
      required: false,
      defaultValue: 0.7,
      metadata: {
        inputType: 'number',
        min: 0,
        max: 2,
        step: 0.1,
      },
    },
    {
      id: 'maxTokens',
      name: 'Max Tokens',
      type: PortType.NUMBER,
      description: 'Maximum tokens to generate',
      required: false,
      defaultValue: 2000,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 32000,
      },
    },
    {
      id: 'historyCount',
      name: 'History Messages',
      type: PortType.NUMBER,
      description: 'Number of previous messages to include',
      required: false,
      defaultValue: 0,
      metadata: {
        inputType: 'number',
        min: 0,
        max: 20,
      },
    },
  ],

  // Output Ports
  outputs: [
    {
      id: 'response',
      name: 'Response',
      type: PortType.TEXT,
      description: 'Generated text response from the LLM',
    },
    {
      id: 'model',
      name: 'Model Used',
      type: PortType.TEXT,
      description: 'Name of the model that generated the response',
    },
    {
      id: 'provider',
      name: 'Provider',
      type: PortType.TEXT,
      description: 'LLM provider type (openai, gemini, etc.)',
    },
    {
      id: 'tokens',
      name: 'Token Count',
      type: PortType.NUMBER,
      description: 'Number of tokens used (if available)',
    },
  ],

  // Dynamic Input Ports - Generated from template variables
  getDynamicInputs: (config: GenerateForm) => {
    if (!config?.prompt) {
      return [];
    }
    
    const variableNames = getInputFromTemplate(config.prompt);
    return variableNames.map((varName) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  // Execution Function
  async execute({ node, config, inputs, dispatcher }) {
    const executor = new GenerateExecutor();
    // Merge config and inputs for form
    const form = { ...config, ...inputs };
    // Minimal context for executor
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'user' as 'user', content: inputs.prompt || '' },
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
      return {
        outputs: {
          response: output.execution.output,
          model: form.model,
          provider: '', // Optionally fill from model/provider if needed
          tokens: undefined,
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          modelId: form.model,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          response: '',
          model: '',
          provider: '',
          tokens: 0,
        },
        status: 'error',
        error: `LLM generation failed: ${errorMessage}`,
        metadata: {
          modelId: form.model,
        },
      };
    }
  },
};

export default GenerateNodeDefinition;
