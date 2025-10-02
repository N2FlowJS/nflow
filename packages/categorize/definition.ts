import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';

export const CategorizeNode: NodeDefinition = {
  id: 'categorize',
  name: 'Categorize',
  category: NodeCategory.AI,
  description:
    'Categorizes input text into predefined categories using AI, routing to different paths based on the result',
  version: '1.0.0',

  inputs: [
    {
      id: 'input',
      name: 'input',
      type: PortType.TEXT,
      description: 'Text to categorize',
    },
  ],

  outputs: [
    {
      id: 'category',
      name: 'category',
      type: PortType.TEXT,
      description: 'Selected category name',
    },
    {
      id: 'confidence',
      name: 'confidence',
      type: PortType.NUMBER,
      description: 'Confidence score (0-1)',
    },
  ],

  getDynamicInputs: () => {
    // Input comes from flow connections, not templates
    return [];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const { model: modelId, categories, defaultCategory } = config;

    try {
      // Get input text
      const inputToCategorize = String(inputs.input || '');
      if (!inputToCategorize) {
        throw new Error('No input available to categorize');
      }

      // Validate categories
      if (!categories || categories.length === 0) {
        throw new Error('No categories defined for categorization');
      }

      // Import Prisma and AI services dynamically
      const { prisma } = await import('../../lib/prisma');

      // Get model from database
      let model;
      if (modelId) {
        model = await prisma.lLMModel.findUnique({
          where: { id: modelId },
          include: { provider: true },
        });
      } else {
        // Use default chat model
        model = await prisma.lLMModel.findFirst({
          where: { modelType: 'chat' },
          include: { provider: true },
        });
      }

      if (!model || !model.provider) {
        throw new Error('No suitable model found for categorization');
      }

      // Build prompt with categories
      const categoriesDescription = categories
        .map((c: any) => `- ${c.name}: ${c.description}${c.examples ? `\n  Examples: ${c.examples.join(', ')}` : ''}`)
        .join('\n');

      const prompt = `
I need to categorize the following text into one of these categories:

${categoriesDescription}

Text to categorize:
"""
${inputToCategorize}
"""

Analyze the text and determine which category it belongs to. Respond with ONLY the category name and a confidence score between 0 and 1, in this exact JSON format:
{"category": "category_name", "confidence": 0.95}
`.trim();

      // Call AI model based on provider type
      let responseText = '';
      switch (model.provider.providerType) {
        case 'openai':
        case 'openai-compatible':
          responseText = await callOpenAIAPI(model.provider, model, prompt);
          break;
        default:
          throw new Error(`Unsupported provider type: ${model.provider.providerType}`);
      }

      // Parse response
      let categoryToUse = defaultCategory;
      let confidence = 0.5;

      try {
        const jsonMatch = responseText.match(/\{[^{]*"category"[^}]*\}/);
        if (jsonMatch) {
          const responseJson = JSON.parse(jsonMatch[0]);
          if (responseJson.category) {
            const matchedCategory = categories.find((cat: any) => cat.name === responseJson.category);
            categoryToUse = matchedCategory ? matchedCategory.name : defaultCategory;
            confidence = responseJson.confidence || 0.5;
          }
        }
      } catch (error) {
        console.error('Failed to parse LLM response for categorization:', error);
        // Falls back to default category
      }

      return {
        outputs: {
          category: categoryToUse,
          confidence,
        },
        status: 'success',
        metadata: {
          modelId: model.id,
          providerType: model.provider.providerType,
          selectedCategory: categoryToUse,
          confidence,
          categoriesCount: categories.length,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          category: config.defaultCategory || '',
          confidence: 0,
        },
        status: 'error',
        error: `Categorization failed: ${errorMessage}`,
      };
    }
  },
};

// Helper function
async function callOpenAIAPI(provider: any, model: any, prompt: string): Promise<string> {
  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more deterministic categorization
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
