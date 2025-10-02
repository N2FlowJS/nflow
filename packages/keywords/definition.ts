import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

export const KeywordsNode: NodeDefinition = {
  id: 'keywords',
  name: 'Keywords (AI)',
  category: NodeCategory.AI,
  description: 'Extracts keywords from text using AI models (OpenAI, Gemini, etc.)',
  version: '1.0.0',

  inputs: [
    {
      id: 'text',
      name: 'text',
      type: PortType.TEXT,
      description: 'Text to extract keywords from',
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

  config: {
    properties: {
      model: {
        type: 'string',
        title: 'AI Model',
        description: 'Model ID from database to use for keyword extraction',
      },
      prompt: {
        type: 'string',
        title: 'Prompt Template',
        description: 'System prompt for keyword extraction (supports template variables)',
        default: 'Extract the most important keywords from the following text. Return only keywords separated by commas.',
      },
      maxResults: {
        type: 'number',
        title: 'Max Results',
        description: 'Maximum number of keywords to extract',
        default: 10,
        minimum: 1,
        maximum: 100,
      },
      numberHistory: {
        type: 'number',
        title: 'History Messages',
        description: 'Number of previous messages to include as context',
        default: 0,
        minimum: 0,
      },
    },
  },

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

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const { model: modelId, prompt: promptTemplate, maxResults } = config;

    // Check if template variables are ready
    const templateVars = getInputFromTemplate(promptTemplate || '');
    for (const varName of templateVars) {
      if (!inputs[varName]) {
        return {
          outputs: { keywords: '', keywordArray: [] },
          status: 'success',
          metadata: {
            waitingFor: templateVars,
          },
        };
      }
    }

    try {
      // Import dependencies dynamically
      const { prisma } = await import('../../lib/prisma');
      const { llmOpenAI } = await import('../../llm/openai');
      const { llmGemini } = await import('../../llm/gemini');

      // Get input text
      const inputText = String(inputs.text || '');
      if (!inputText) {
        throw new Error('No input text available for keyword extraction');
      }

      // Process template
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        vars[key] = String(inputs[key] || '');
      });

      const prompt = processTemplate(promptTemplate || '', vars);

      // Fetch model details from database
      if (!modelId) {
        throw new Error('No AI model specified');
      }

      const model = await prisma.lLMModel.findUnique({
        where: { id: modelId },
        include: { provider: true },
      });

      if (!model) {
        throw new Error('Model not found in the database');
      }
      if (!model.provider) {
        throw new Error('Provider not found for this model');
      }

      // Prepare messages
      const message: Array<{ role: 'system' | 'user'; content: string }> = [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: inputText,
        },
      ];

      // Call AI model based on provider type
      let aiResponse = '';
      switch (model.provider.providerType) {
        case 'openai':
        case 'openai-compatible':
        case 'grok':
          aiResponse = await llmOpenAI.completions(
            model.provider.endpointUrl,
            model.provider.apiKey,
            model.name,
            message
          );
          break;
        case 'gemini':
          aiResponse = await llmGemini.completions(
            model.provider.endpointUrl,
            model.provider.apiKey,
            model.name,
            message
          );
          break;
        default:
          throw new Error(`Unsupported provider type: ${model.provider.providerType}`);
      }

      // Process keywords response
      const maxKeywords = maxResults || 10;
      let keywords = aiResponse
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywords.length > maxKeywords) {
        keywords = keywords.slice(0, maxKeywords);
      }

      const formattedKeywords = keywords.join(', ');

      return {
        outputs: {
          keywords: formattedKeywords,
          keywordArray: keywords,
        },
        status: 'success',
        metadata: {
          modelId,
          providerType: model.provider.providerType,
          keywordCount: keywords.length,
          maxResults: maxKeywords,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          keywords: '',
          keywordArray: [],
        },
        status: 'error',
        error: `Keyword extraction failed: ${errorMessage}`,
        metadata: {
          modelId,
        },
      };
    }
  },
};
