import { NodeCategory, NodeDefinition } from '../@node-plugin/type';
import { KeywordsExecutor } from './executor';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';

export const KeywordsNode: NodeDefinition = {
  id: 'keywords',
  name: 'Keywords (AI)',
  category: NodeCategory.AI,
  description: 'Extracts keywords from text using AI models (OpenAI, Gemini, etc.)',
  version: '1.0.0',

  inputs: [
    {
      id: 'text',
      name: 'Text',
      type: PortType.TEXT,
      description: 'Text to extract keywords from',
      required: true,
    },
    {
      id: 'model',
      name: 'AI Model',
      type: PortType.TEXT,
      description: 'AI model to use for keyword extraction',
      required: true,
      metadata: {
        inputType: 'model-selector',
      },
    },
    {
      id: 'prompt',
      name: 'Prompt Template',
      type: PortType.TEXT,
      description: 'Instructions for the AI on how to extract keywords. Use {variables} for dynamic content.',
      defaultValue: 'Extract the most important keywords from the following text. Return them as a comma-separated list:\n\n{text}',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 4,
      },
    },
    {
      id: 'maxResults',
      name: 'Max Keywords',
      type: PortType.NUMBER,
      description: 'Maximum number of keywords to extract',
      defaultValue: 10,
      required: false,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 50,
      },
    },
    {
      id: 'numberHistory',
      name: 'History Messages',
      type: PortType.NUMBER,
      description: 'Number of previous messages to include in context',
      defaultValue: 0,
      required: false,
      metadata: {
        inputType: 'number',
        min: 0,
        max: 10,
      },
    },
  ],

  outputs: [
    {
      id: 'keywords',
      name: 'keywords',
      type: PortType.TEXT,
      description: 'Comma-separated keywords',
    },
    {
      id: 'keywordArray',
      name: 'keywordArray',
      type: PortType.ARRAY,
      description: 'Array of keywords',
    },
  ],

  getDynamicInputs: (config) => {
    const variableNames: string[] = [];
    if (config.prompt) {
      variableNames.push(...getInputFromTemplate(config.prompt));
    }
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

  async execute({ node, config, inputs, dispatcher }) {
    const executor = new KeywordsExecutor();
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
      input: { role: 'user' as 'user', content: '' },
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
      const keywords = output.execution.output.split(',').map(k => k.trim()).filter(k => k.length > 0);
      return {
        outputs: {
          keywords: output.execution.output,
          keywordArray: keywords,
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          modelId: form.model,
          keywordCount: keywords.length,
          maxResults: form.maxResults || 10,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          keywords: '',
          keywordArray: [],
        },
        status: 'error',
        error: `Keyword extraction failed: ${errorMessage}`,
        metadata: {
          modelId: form.model,
        },
      };
    }
  },
};
