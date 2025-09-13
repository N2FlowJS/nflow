import { MessagePart } from '../models/MessagePart';

function messagesToGeminiContent(messages: MessagePart[]): any[] {
	const text = messages
		.map((m) => {
			const role = m.role || 'user';
			return `${role}: ${m.content || ''}`;
		})
		.join('\n');

	return [
		{
			role: 'user',
			parts: [{ text }],
		},
	];
}

class LLMGemini {
	readonly name = 'Google Gemini';
	readonly icon = 'gemini';
	completions = async (
		baseURL: string,
		apiKey: string,
		model: string,
		message: MessagePart[],
		options?: any,
		_callback?: (result: string) => void
	): Promise<string> => {
		const url = `${baseURL.replace(/\/$/, '')}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

		const body: any = {
			contents: messagesToGeminiContent(message),
			generationConfig: {
				temperature: options?.temperature ?? 0.7,
				maxOutputTokens: options?.maxTokens,
				topP: options?.topP,
				stopSequences: options?.stop,
			},
		};

		const resp = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await resp.json();
		if (!resp.ok || data.error) {
			throw new Error(data.error?.message || `Gemini error ${resp.status}: ${resp.statusText}`);
		}

		const text =
			data.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('') ||
			data.candidates?.[0]?.output_text ||
			'';
		return text;
	};

		embeddings = async (
			baseURL: string,
			apiKey: string,
			model: string,
			input: string | string[]
		): Promise<{ data: { embedding: number[] }[]; usage?: { total_tokens?: number } }> => {
			// Gemini embeddings endpoint: models/{model}:embedContent
			const url = `${baseURL.replace(/\/$/, '')}/models/${encodeURIComponent(model)}:embedContent?key=${encodeURIComponent(apiKey)}`;
			const content = Array.isArray(input) ? input.join('\n') : input;
			const body: any = {
				content: { parts: [{ text: content }] },
			};

			const resp = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const data = await resp.json();
			if (!resp.ok || data.error) {
				throw new Error(data.error?.message || `Gemini Embeddings error ${resp.status}: ${resp.statusText}`);
			}

			// Gemini returns { embedding: { values: number[] } }
			const embedding = data.embedding?.values || [];
			return { data: [{ embedding }] };
		};

			models = async (
				baseURL: string,
				apiKey: string
			): Promise<Array<{ id: string; displayName?: string }>> => {
				const url = `${baseURL.replace(/\/$/, '')}/models?key=${encodeURIComponent(apiKey)}`;
				const resp = await fetch(url, { method: 'GET' });
				const data = await resp.json();
				if (!resp.ok || data.error) {
					throw new Error(data.error?.message || `Gemini Models error ${resp.status}: ${resp.statusText}`);
				}

				// Normalize to array of { id, displayName }
				const items: any[] = data.models || data.data || [];
				return items.map((m: any) => ({ id: m.name || m.id, displayName: m.displayName || m.description }));
			};
}

export const llmGemini = new LLMGemini();
export default llmGemini;

