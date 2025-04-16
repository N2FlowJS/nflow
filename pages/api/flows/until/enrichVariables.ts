// Helper to enrich variables with OpenAI parameters
export function enrichVariables(variables: Record<string, any>, openAIParams: { model: string; temperature: number; maxTokens: number; topP: number; }): Record<string, any> {
  return {
    ...variables,
    openai: {
      model: openAIParams.model,
      temperature: openAIParams.temperature,
      max_tokens: openAIParams.maxTokens,
      top_p: openAIParams.topP,
    },
  };
}
