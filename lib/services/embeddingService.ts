/**
 * Service for generating vector embeddings from text
 */

// Default embedding model - could be configurable in the future
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/";

interface EmbeddingResponse {
  embedding: number[];
  tokenCount: number;
}

/**
 * Generate vector embeddings for a text chunk using OpenAI API
 */
export async function generateEmbedding(
  text: string
): Promise<EmbeddingResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  const url = `${OPENAI_BASE_URL}embeddings`;
  
  // Log minimal info to reduce noise in logs
  console.log(`Generating embedding for text (length: ${text.length})`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: EMBEDDING_MODEL,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.error?.message || response.statusText;
      // Add more context to the error for easier debugging
      console.error(`OpenAI API error (${response.status}): ${errorMessage}`);
      throw new Error(`API error: ${errorMessage}`);
    }

    // Validate that we received the expected data
    if (!result.data?.[0]?.embedding) {
      throw new Error("Invalid response: missing embedding data");
    }

    return {
      embedding: result.data[0].embedding,
      tokenCount: result.usage?.total_tokens,
    };
  } catch (error) {
    // Add more context to the error
    if (error instanceof Error) {
      console.error(`Error generating embedding: ${error.message}`);
      // Keep the original error for stack trace
      throw error;
    } else {
      console.error("Unknown error generating embedding:", error);
      throw new Error(`Unknown error: ${String(error)}`);
    }
  }
}

/**
 * Generate embeddings for multiple text chunks in parallel
 * with rate limiting to avoid API throttling
 */
export async function generateEmbeddingsInBatches(
  textChunks: string[],
  batchSize: number = 5
): Promise<EmbeddingResponse[]> {
  const results: EmbeddingResponse[] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < textChunks.length; i += batchSize) {
    const batch = textChunks.slice(i, i + batchSize);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map((text) => generateEmbedding(text))
    );

    results.push(...batchResults);

    // Add delay between batches if not the last batch
    if (i + batchSize < textChunks.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
