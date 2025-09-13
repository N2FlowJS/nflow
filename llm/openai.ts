import OpenAI from 'openai';
import { MessagePart } from '../models/MessagePart';

class LLMOpenAI {
  readonly name = 'OpenAI';
  readonly icon = 'openai';
  completions = async (baseURL: string, apiKey: string, model: string, message: MessagePart[], options?: any, callback?: (result: string) => void): Promise<string> => {
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: model,
      messages: message as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      stop: options?.stop,
      stream: !!callback,
    };

    if (params.stream) {
      // Stream mode
      const stream = await openai.chat.completions.create(params);
      let result = '';

      for await (const part of stream) {
        const content = part.choices?.[0]?.delta?.content || '';
        if (content) {
          result += content;
          if (callback) callback(result);
        }
      }

      return result;
    } else {
      // Non-stream mode
      const completion = await openai.chat.completions.create(params);
      return completion.choices[0].message.content || '';
    }
  };

  /**
   * Generate embeddings using the OpenAI API
   */
  embeddings = async (baseURL: string, apiKey: string, model: string, input: string | string[]): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> => {
    console.log('Base URL:', baseURL);
    console.log('API Key:', apiKey);
    console.log('Model:', model);
    console.log('Input:', input);

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });
    console.log(`Generating embeddings for input: ${JSON.stringify(input)}`);
    console.log(`Using model: ${model}`);
    const response = await openai.embeddings.create({
      model: model,
      input: input,
    });

    return response;
  };

  /**
   * Fetch available models from OpenAI API
   */
  models = async (baseURL: string, apiKey: string): Promise<OpenAI.Models.Model[]> => {
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    try {
      const response = await openai.models.list();
      return response.data;
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      throw error;
    }
  };
}

export const llmOpenAI = new LLMOpenAI();
