import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { KeywordsForm } from './types';

export class KeywordsExecutor extends BaseNodeExecutor<KeywordsForm> {
  constructor() {
    super({
      nodeType: 'keywords',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['prompt'],
    });
  }

  protected async executeLogic(form: KeywordsForm, context: ExecutionContext): Promise<string> {
    // Dynamic import for dependencies
    const { prisma } = await import('../../lib/prisma');
    const { llmOpenAI } = await import('../../llm/openai');
    const { llmGemini } = await import('../../llm/gemini');

    // Get input text
    const inputText = String(context.resolvedInputs.text || '');
    if (!inputText) throw new Error('No input text available for keyword extraction');

    // Process template
    const prompt = context.templateVariables['prompt'] || form.prompt || '';

    // Fetch model details from database
    const modelId = form.model;
    if (!modelId) throw new Error('No AI model specified');
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: { provider: true },
    });
    if (!model) throw new Error('Model not found in the database');
    if (!model.provider) throw new Error('Provider not found for this model');

    // Prepare messages
    const message = [
      { role: 'system' as 'system', content: prompt },
      { role: 'user' as 'user', content: inputText },
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
    const maxKeywords = form.maxResults || 10;
    let keywords = aiResponse
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (keywords.length > maxKeywords) {
      keywords = keywords.slice(0, maxKeywords);
    }
    return keywords.join(', ');
  }
}

export default KeywordsExecutor;
