import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { CategorizeForm } from './types';

export class CategorizeExecutor extends BaseNodeExecutor<CategorizeForm> {
  constructor() {
    super({
      nodeType: 'categorize',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['input'],
    });
  }

  protected async executeLogic(form: CategorizeForm, context: ExecutionContext): Promise<string> {
    const { categories, model: modelId, defaultCategory } = form;

    // Get input text from resolved inputs
    const inputToCategorize = String(context.resolvedInputs.input || '');
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
        responseText = await this.callOpenAIAPI(model.provider, model, prompt);
        break;
      default:
        throw new Error(`Unsupported provider type: ${model.provider.providerType}`);
    }

    // Parse response
    let categoryToUse = defaultCategory || categories[0]?.name || '';
    let confidence = 0.5;

    try {
      const jsonMatch = responseText.match(/\{[^{]*"category"[^}]*\}/);
      if (jsonMatch) {
        const responseJson = JSON.parse(jsonMatch[0]);
        if (responseJson.category) {
          const matchedCategory = categories.find((cat: any) => cat.name === responseJson.category);
          categoryToUse = matchedCategory ? matchedCategory.name : categoryToUse;
          confidence = responseJson.confidence || 0.5;
        }
      }
    } catch (error) {
      console.error('Failed to parse LLM response for categorization:', error);
      // Falls back to default category
    }

    // Return structured result
    return JSON.stringify({
      category: categoryToUse,
      confidence,
      metadata: {
        modelId: model.id,
        providerType: model.provider.providerType,
        selectedCategory: categoryToUse,
        confidence,
        categoriesCount: categories.length,
      }
    });
  }

  private async callOpenAIAPI(provider: any, model: any, prompt: string): Promise<string> {
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
}

export const categorizeExecutor = new CategorizeExecutor();
