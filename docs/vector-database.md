# NFlow Vector Database Guide

## Overview

Vector databases are a critical component of NFlow's semantic search capabilities. They store and efficiently retrieve vector embeddings (numerical representations of text) to enable similarity search. This guide covers the vector database options in NFlow, their configuration, and best practices.

## Vector Database Options

NFlow supports two primary vector database options:

1. **Local SQLite Vector Storage**
   - Stores vectors directly in the SQLite database
   - Simple to set up with no additional services
   - Good for small to medium datasets
   - Limited performance for large collections
   
2. **NBase Vector Database**
   - High-performance specialized vector database
   - Optimized indexing for fast similarity search
   - Supports large datasets with millions of vectors
   - Requires a separate service (included with NFlow)

## Choosing a Vector Database

| Consideration | Local SQLite | NBase |
|---------------|--------------|-------|
| Setup complexity | Simple | Moderate |
| Performance | Good for small datasets | Excellent for all sizes |
| Memory usage | High for large datasets | Optimized |
| Scaling | Limited | Good |
| Maintenance | Minimal | Some maintenance required |
| Recommended use | Development, small applications | Production, large datasets |

## Local SQLite Vector Database

### Configuration

The local vector database is the default option and requires no additional configuration. It stores vectors as serialized JSON in the SQLite database.

To explicitly configure it:

```
VECTOR_DB_TYPE=local
```

### How It Works

1. Vectors are serialized to JSON and stored in the `TextChunk` table
2. Search is performed by loading vectors into memory and computing similarity
3. Cosine similarity is used as the distance metric

### Limitations

1. Performance degrades with large datasets (>100,000 vectors)
2. All vectors must fit in memory during search
3. No advanced indexing for accelerated search

## NBase Vector Database

NBase is a specialized vector database included with NFlow that provides high-performance similarity search capabilities.

### Configuration

To use NBase:

```
VECTOR_DB_TYPE=nbase
NBASE_HOST=localhost      # Optional: NBase server host
NBASE_PORT=1307           # Optional: NBase server port
NBASE_URL=http://localhost:1307  # Optional: Override full URL
```

### Starting NBase

In development mode, NBase is automatically started when needed. For production:

```bash
# Method 1: Using the provided script
npm run start:nbase

# Method 2: Directly
cd nbase
npm install
npm run build
npm start
```

### Architecture

NBase uses a client-server architecture:

1. **Server**: Manages vector storage, indexing and search operations
2. **Client**: Integrated into NFlow, communicates with the server via REST API

### Features

1. **Efficient Vector Storage**: Optimized storage of high-dimensional vectors
2. **Fast Similarity Search**: Multiple search algorithms (brute force, HNSW, PQ)
3. **Metadata Filtering**: Filter search results by metadata attributes
4. **Persistence**: Save/load vector data to/from disk
5. **Clustering**: Group similar vectors for faster retrieval
6. **Hybrid Search**: Combine vector similarity with metadata filtering

### Database Types

NBase includes several database implementations:

1. **ClusteredVectorDB** (default): Organizes vectors into clusters for efficient search
2. **MemoryMappedDB**: Uses memory-mapped files for large datasets
3. **PartitionedDB**: Distributes vectors across multiple partitions for scaling

### Performance Optimization

1. **Choose the right database type**:
   - ClusteredVectorDB for general use
   - MemoryMappedDB for datasets larger than available RAM
   - PartitionedDB for horizontal scaling

2. **Adjust index parameters**:
   ```
   NBASE_INDEX_HNSW_M=16         # Connections per node
   NBASE_INDEX_HNSW_EF_CONSTRUCTION=200  # Index quality
   NBASE_INDEX_HNSW_EF_SEARCH=50  # Search quality/speed tradeoff
   ```

3. **Set appropriate batch sizes**:
   ```
   NBASE_BATCH_SIZE=100  # Batch size for operations
   ```

### Monitoring

NBase provides several monitoring endpoints:

1. `/health`: Check server health
2. `/stats`: Get database statistics
3. `/api/index/:type`: Get index information

Example health check:

```javascript
async function checkNbaseHealth() {
  try {
    const response = await fetch('http://localhost:1307/health');
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}
```

### Backup and Persistence

NBase supports saving/loading vector databases to/from disk:

```javascript
// Save database
await fetch('http://localhost:1307/api/db/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/path/to/save/database.nbase'
  })
});

// Load database
await fetch('http://localhost:1307/api/db/load', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/path/to/load/database.nbase'
  })
});
```

## Vector Generation Process

Regardless of the database used, the vector generation process in NFlow works as follows:

1. **Document Upload**: User uploads a document
2. **Text Extraction**: Text is extracted from the document
3. **Text Chunking**: Text is divided into smaller chunks
4. **Embedding Generation**: OpenAI API generates embeddings for each chunk
5. **Vector Storage**: Embeddings are stored in the vector database

## Implementation Details

### Embedding Generation

NFlow uses OpenAI's embedding models, with `text-embedding-3-small` as the default:

```typescript
const embeddingResult = await generateEmbedding(text);
// Returns { embedding: number[], tokenCount: number }
```

The embedding dimension is 1536 by default.

### Vector Search

The search process:

1. Generate embedding for the query text
2. Find similar vectors using the configured vector database
3. Return matching text chunks with similarity scores

```typescript
const results = await searchSimilarContent(
  queryText,
  { knowledgeId, fileId, limit }
);
// Returns array of matches with content and similarity score
```

## Best Practices

### Vector Database Selection

1. Start with the local SQLite database for development
2. Switch to NBase for production or large datasets
3. Consider memory requirements when choosing a database

### Performance Optimization

1. **Chunk Size**: Use appropriate text chunk sizes (1000-2000 characters)
2. **Batch Processing**: Use batch operations for large document sets
3. **Index Building**: Build search indexes for large collections
4. **Query Filtering**: Apply metadata filters to narrow search

### Deployment Considerations

1. **Resource Allocation**: Ensure sufficient memory for vector operations
2. **Persistent Storage**: Configure proper backup for vector databases
3. **Monitoring**: Set up health checks for the vector database
4. **Scaling**: Consider partitioning for very large collections

## Troubleshooting

### Common Issues

1. **Slow Search Performance**
   - Check vector database size
   - Verify indexes are built
   - Consider switching to NBase with HNSW indexing

2. **Memory Usage Issues**
   - Reduce batch sizes for operations
   - Consider MemoryMappedDB for large datasets
   - Increase available RAM for the NBase server

3. **Connection Issues**
   - Verify NBase server is running
   - Check port configuration and firewall settings
   - Look for connection errors in logs

### Diagnostic Tools

1. **Database Statistics**
   - `http://localhost:1307/api/stats`
   - `getFileVectorStats()` function

2. **Health Checks**
   - `http://localhost:1307/api/health`
   - NBase health monitoring service

3. **Log Analysis**
   - Enable detailed logging with `DEBUG=nbase:*`
   - Check for connection and query errors

## Advanced Configuration

### Custom Embedding Models

You can use alternative embedding models by configuring:

```
EMBEDDING_MODEL=alternative-model-name
```

### Custom Vector Distance Metrics

NBase supports multiple distance metrics:

```
NBASE_DISTANCE_METRIC=cosine  # Options: cosine, euclidean, dot_product
```

### Hybrid Search Configuration

Tune hybrid search parameters:

```
NBASE_HYBRID_SEARCH_WEIGHT=0.7  # Weight for vector similarity (0-1)
```

### Performance Tuning

For high-load scenarios:

```
NBASE_CONNECTION_POOL_SIZE=10  # Connection pooling
NBASE_MAX_CONCURRENT_SEARCHES=20  # Limit concurrent operations
```

## Migration Between Vector Databases

To migrate from SQLite to NBase:

1. Export vectors from SQLite:
   ```bash
   npm run export-vectors --output=vectors.json
   ```

2. Import vectors to NBase:
   ```bash
   npm run import-vectors --source=vectors.json --target=nbase
   ```

## Further Resources

- [NBase API Documentation](../nbase/docs/api-docs.md)
- [NBase Core Database Documentation](../nbase/docs/core_database.md)
- [Embedding Models Guide](./embedding-models.md)
- [Performance Tuning Guide](./performance-tuning.md)
