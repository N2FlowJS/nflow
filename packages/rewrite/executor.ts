import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { RewriteForm } from './types';

export class RewriteExecutor extends BaseNodeExecutor<RewriteForm> {
  constructor() {
    super({
      nodeType: 'rewrite',
      defaultRole: 'assistant',
      checkInputReadiness: true,
      templateFields: ['prompt'],
    });
  }

  protected async executeLogic(form: RewriteForm, context: ExecutionContext): Promise<string> {
    // Dynamic import for dependencies
    const { prisma } = await import('../../lib/prisma');
    const { llmOpenAI } = await import('../../llm/openai');
    const { llmGemini } = await import('../../llm/gemini');

    // Prepare variables for template processing
    const historyMessages = (context.flowState.history || [])
      .slice(-(form.numberHistory || 5))
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');
    const vars: Record<string, string> = {
      conversation: historyMessages,
      userInput: context.resolvedInputs.text || '',
    };
    // Add template variables from context
    Object.assign(vars, context.templateVariables);

    // Process prompt template
    const prompt = form.prompt;

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
      { role: 'user' as 'user', content: vars.userInput },
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

    return aiResponse;
  }
}

export default RewriteExecutor;
