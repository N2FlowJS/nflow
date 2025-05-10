import { LLMProvider, LLMModel } from '../models/llm';

/**
 * Get the best LLM model to use based on user preferences and available models
 * 
 * @param modelType The type of model needed (chat, text, embedding, image)
 * @param userPreferences User's LLM preferences
 * @param providers Available LLM providers
 * @param defaultProviderId User's default provider ID (optional)
 * @returns The ID of the best model to use, or undefined if none found
 */
export function getBestModelForType(
  modelType: string,
  userPreferences: any,
  providers: LLMProvider[],
): string | undefined {
  // 1. Check if user has a preference for this model type
  const preferredModelId = userPreferences?.models?.[modelType];
  if (preferredModelId) {
    // Verify this model still exists
    for (const provider of providers) {
      const model = provider.models.find(m => m.id === preferredModelId);
      if (model) return model.id;
    }
  }
  

  
  // 4. Fall back to any provider with an active model of the right type
  for (const provider of providers) {
    const defaultModel = provider.models.find(
      m => m.modelType === modelType
    );
    if (defaultModel) return defaultModel.id;
    
    // Then any active model
    const anyModel = provider.models.find(
      m => m.modelType === modelType
    );
    if (anyModel) return anyModel.id;
  }
  
  // No suitable model found
  return undefined;
}

/**
 * Get the model object by its ID
 */
export function getModelById(
  modelId: string,
  providers: LLMProvider[]
): LLMModel | undefined {
  for (const provider of providers) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

/**
 * Get the provider for a specific model
 */
export function getProviderForModel(
  modelId: string,
  providers: LLMProvider[]
): LLMProvider | undefined {
  for (const provider of providers) {
    if (provider.models.some(m => m.id === modelId)) {
      return provider;
    }
  }
  return undefined;
}
