# Embedding Models in NFlow

## Introduction

Vector embeddings are numerical representations of text that capture semantic meaning, enabling similarity comparisons. NFlow uses these embeddings to power semantic search and content organization. This guide explains the embedding models supported by NFlow, their configuration, and best practices.

## Supported Embedding Models

NFlow primarily uses OpenAI's embedding models, with `text-embedding-3-small` as the default choice. The system can be configured to use different models based on your requirements.

### Default Model: text-embedding-3-small

- **Dimensions**: 1536
- **Context Length**: 8191 tokens
- **Performance**: Excellent quality-to-cost ratio
- **Use Case**: General purpose embeddings for most applications

### Alternative Models

| Model | Dimensions | Max Tokens | Strengths | Best For |
|-------|------------|------------|-----------|----------|
| text-embedding-3-large | 3072 | 8191 | Highest accuracy | Critical applications requiring maximum precision |
| text-embedding-ada-002 | 1536 | 8191 | Legacy compatibility | Backwards compatibility with existing systems |
| all-MiniLM-L6-v2 | 384 | 512 | Compact, efficient | Resource-constrained environments |

## Configuration

You can configure the embedding model through environment variables:

```
# In your .env file
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1/  # Optional: Override for custom endpoints
```

## Understanding Embedding Dimensions

The dimension of an embedding vector determines:

1. **Storage Requirements**: Higher dimensions require more storage
2. **Search Performance**: Higher dimensions may require more computation time

## Embedding Generation Process

When a document is processed in NFlow, the following steps occur:

1. **Text Extraction**: The document is parsed and text is extracted
2. **Chunking**: The text is divided into manageable chunks (typically 1000-2000 characters)
3. **Embedding Generation**: Each chunk is sent to the OpenAI API to generate embeddings
4. **Storage**: The embeddings are stored in the vector database for later retrieval

This process is handled by the `EmbeddingService`:

```typescript
// Example embedding generation
const embeddingResult = await generateEmbedding(textChunk);

// Result format
// {
//   embedding: [0.123, 0.456, ...], // 1536 numbers for default model
//   tokenCount: 42 // Number of tokens processed
// }
```

## Batching and Rate Limiting

To avoid rate limits with the OpenAI API, NFlow processes embeddings in batches:

```typescript
// Process multiple text chunks in batches
const embeddings = await generateEmbeddingsInBatches(
  textChunks,
  batchSize = 5  // Number of parallel requests (adjustable)
);
```

This approach:
- Limits concurrent API calls
- Adds a delay between batches
- Provides better error handling

## Token Usage and Costs

When using OpenAI's embedding models, be aware of token usage:

1. **Token Counting**: One token is approximately 4 characters in English
2. **Pricing**: OpenAI charges based on input tokens processed
3. **Batching Impact**: Proper batching can optimize API usage and reduce costs

NFlow tracks token usage for each embedding request, which you can use for cost monitoring.

## Custom Embedding Providers

You can integrate NFlow with alternative embedding providers by implementing a custom embedding service:

1. Create a new service file in `lib/services/customEmbeddingService.ts`
2. Implement the required interface
3. Update `embeddingService.ts` to use your provider based on configuration

Example implementation for a hypothetical embedding provider:

```typescript
// Custom embedding service
export async function generateCustomEmbedding(text: string): Promise<{
  embedding: number[];
  tokenCount: number;
}> {
  // Call your custom embedding API
  const response = await fetch('https://your-embedding-provider.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  const result = await response.json();
  
  return {
    embedding: result.vector,
    tokenCount: result.tokens || Math.ceil(text.length / 4)
  };
}
```

## Self-Hosted Models

For privacy-sensitive applications or to reduce API costs, you can self-host embedding models:

1. **Local Models**: Use frameworks like Hugging Face's Sentence Transformers
2. **API Proxy**: Set up a local model server and configure `OPENAI_BASE_URL`
3. **Containerized Deployment**: Use Docker to deploy models within your infrastructure

Example configuration for a self-hosted model:

```
EMBEDDING_MODEL=all-MiniLM-L6-v2
OPENAI_BASE_URL=http://localhost:8000/v1/
```

## Best Practices

### Model Selection

1. **Start Simple**: Begin with `text-embedding-3-small` for most applications
2. **Benchmark**: Test different models with your specific data and queries
3. **Cost vs. Quality**: Consider the tradeoff between embedding quality and API costs

### Performance Optimization

1. **Appropriate Chunk Size**: Find the optimal text chunk size for your content
2. **Efficient Batching**: Adjust batch sizes based on your rate limits and response times
3. **Caching**: Consider caching embeddings for frequently processed text

### Error Handling

NFlow implements robust error handling for embedding generation:

1. **Retry Logic**: Failed requests are retried with exponential backoff
2. **Fallback Strategies**: When embeddings fail, NFlow can fall back to keyword search
3. **Monitoring**: Error rates and response times are logged for troubleshooting

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify your OpenAI API key is valid
   - Check API key permissions and usage limits

2. **Rate Limiting**
   - Reduce batch size if encountering rate limits
   - Implement more aggressive backoff between batches

3. **Model Compatibility**
   - Ensure embedding dimension matches the model output
   - Verify the model name is spelled correctly

### Diagnostics

To troubleshoot embedding issues, enable detailed logging:

```
# In your .env file
DEBUG=nflow:embedding:*
LOG_LEVEL=debug
```

This will provide more information about:
- API requests and responses
- Token usage and rate limiting
- Error details and retries

## Advanced Topics

### Fine-Tuning Embeddings

For specialized domains, you might benefit from fine-tuned embedding models:

1. **Domain Adaptation**: Fine-tune models on your specific content
2. **Evaluation**: Compare performance against general-purpose models
3. **Deployment**: Host fine-tuned models for your application

### Hybrid Search Approaches

NFlow can combine embedding-based search with traditional methods:

1. **Vector + Keyword**: Use both approaches and blend results
2. **Filtered Vector Search**: Apply metadata filters before similarity search
3. **Re-ranking**: Use embeddings for initial retrieval and another model for ranking

## Future Developments

The field of embeddings is rapidly evolving. NFlow is designed to adapt to new models and techniques:

1. **Multimodal Embeddings**: Support for images, audio, and text in the same embedding space
2. **Sparse-Dense Hybrids**: Combining traditional sparse vectors with dense embeddings
3. **Smaller, Faster Models**: Integration with more efficient embedding models as they become available

## Resources

- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Hugging Face Sentence Transformers](https://www.sbert.net/)
- [Understanding Embeddings Guide](./understanding-embeddings.md)
- [Vector Search Fundamentals](./vector-search-fundamentals.md)
