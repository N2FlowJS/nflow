import type { SupportedProvider } from '../../llm/llm';
import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { GenerateForm } from './types';
// SupportedProvider type used only for casting, no import needed

export class GenerateExecutor extends BaseNodeExecutor<GenerateForm> {
  constructor() {
    super({
      nodeType: 'generate',
      defaultRole: 'assistant',
      checkInputReadiness: true,
      templateFields: ['prompt'],
    });
  }

  protected async executeLogic(form: GenerateForm, context: ExecutionContext): Promise<string> {
    // Dynamic import for dependencies
    const { prisma } = await import('../../lib/prisma');
    const llm = (await import('../../llm/llm')).default;
  // SupportedProvider is a type, not a runtime value; use for casting only

    // Get prompt and model
    const promptTemplate = form.prompt;
    const modelId = form.model;
    if (!promptTemplate) throw new Error('Prompt is required');
    if (!modelId) throw new Error('Model ID is required');

    // Extract template variables from prompt
  // Removed unused vars declaration
    const processedPrompt = promptTemplate; // Assume template already processed by base executor

    // Build message history
    const historyCount = form.numberHistory || 0;
    const historyMessages = context.flowState.history
      ? context.flowState.history.slice(-historyCount).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content || '',
        }))
      : [];

    // Build message array
    const messages = [
      { role: 'system' as const, content: processedPrompt },
      ...historyMessages,
    ].filter((msg) => msg.content && msg.content.trim() !== '');

    // Fetch model from database
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: { provider: true },
    });
    if (!model) throw new Error(`Model not found: ${modelId}`);
    if (!model.provider) throw new Error(`Provider not found for model: ${modelId}`);

    // Call LLM
    const response = await llm.completions(
  model.provider.providerType as SupportedProvider,
      model.provider.endpointUrl,
      model.provider.apiKey,
      model.name,
      messages,
      {
        temperature: (form as any).temperature,
        max_tokens: (form as any).maxTokens,
      },
      undefined // No streaming callback
    );

    return response;
  }
}

export default GenerateExecutor;
