import OpenAI from 'openai';
import 'openai/shims/node'
import { MessagePart } from '../models/MessagePart';

class LLMOpenAI {
    completions = async (
        baseURL: string,
        apiKey: string,
        model: string,
        message: MessagePart[],
        options?: any,
        callback?: (result: string) => void): Promise<string> => {
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
    }

    /**
     * Generate embeddings using the OpenAI API
     */
    embeddings = async (
        baseURL: string,
        apiKey: string,
        model: string,
        input: string | string[]
    ): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> => {
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL,
        });

        const response = await openai.embeddings.create({
            model: model,
            input: input,
        });

        return response;
    }
}

export const llmOpenAI = new LLMOpenAI()