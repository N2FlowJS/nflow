---
layout: default
title: NBase Integration
nav_order: 9
---

# NBase Integration Guide

## Overview

NBase is a high-performance vector database designed for fast similarity search and large-scale embedding storage. It integrates seamlessly with NFlow to power semantic search and knowledge management for AI applications.

## Key Features

- High-speed vector search (KNN, HNSW, Hybrid)
- Metadata filtering support
- Bulk vector import/export operations
- Configurable search algorithms and parameters
- Simple RESTful API

## Configuring NBase with NFlow

Add the following environment variables to your `.env` file:

```env
# Vector database type
VECTOR_DB_TYPE=nbase

# NBase server URL
NBASE_URL=http://localhost:1307
```

Optional advanced settings:

```env
NBASE_BATCH_SIZE=100                # Batch size for vector operations
NBASE_CONNECTION_TIMEOUT=5000       # Connection timeout in ms
NBASE_DISTANCE_METRIC=cosine        # Options: cosine, euclidean, dot_product
NBASE_HYBRID_SEARCH_WEIGHT=0.7      # Hybrid search weight (0-1)
NBASE_CONNECTION_POOL_SIZE=10       # Connection pool size
NBASE_MAX_CONCURRENT_SEARCHES=20    # Max concurrent searches
```

## Installing and Running NBase

### 1. Manual Installation

```bash
git clone https://github.com/n-flow/nbase.git
cd nbase
npm install
npm run build
npm start
```

### 2. Docker Deployment

```bash
docker run -p 1307:1307 -v /path/to/data:/data nflow/nbase
```

### 3. Server Configuration (optional)

```env
PORT=1307
CLUSTER_SIZE=1000
VECTOR_SIZE=1536
STORAGE_PATH=/data
```

## Connecting NFlow to NBase

- Ensure the NBase server is running and accessible at `NBASE_URL`
- Update your NFlow environment variables as shown above
- Restart your NFlow application

## Verifying Integration

1. Upload a document to your knowledge base
2. Check the logs to confirm vectors are stored in NBase
3. Perform a search to verify vector queries

You can also check NBase server status:

```bash
curl http://localhost:1307/stats
```

## Troubleshooting

- Ensure the NBase server is running and not blocked by firewalls
- Double-check your environment variable configuration
- Review NFlow logs for NBase connection errors
- Make sure the NBase server has enough memory for large vector operations

## Advanced Configuration

- Enable persistence in NBase for durable storage
- Set up API authentication for NBase if needed
- Use load balancing for high-traffic applications

## Migrating Vector Data

To migrate vectors from SQLite to NBase:

```bash
npm run export-vectors --output=vectors.json
npm run import-vectors --source=vectors.json --target=nbase
```

## References

- [NBase API Documentation](../nbase/docs/api-docs.md)
- [NBase Core Database Documentation](../nbase/docs/core_database.md)
- [Embedding Models Guide](./embedding-models.md)
- [Performance Tuning Guide](./performance-tuning.md)
