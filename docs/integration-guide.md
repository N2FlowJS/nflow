# NFlow Integration Guide

## Overview

This guide explains how to integrate NFlow with other systems. NFlow provides several integration points including a REST API, webhook system, and direct database access options.

## Table of Contents

1. [REST API Integration](#rest-api-integration)
2. [Webhook Integration](#webhook-integration)
3. [Vector Database Integration](#vector-database-integration)
4. [Embedding Model Integration](#embedding-model-integration)
5. [Authentication Integration](#authentication-integration)
6. [Custom Extensions](#custom-extensions)

## REST API Integration

NFlow provides a comprehensive REST API for integration with external systems.

### API Authentication

All API requests require authentication using either:

1. **API Key**: Pass in the `X-API-Key` header
2. **JWT Token**: Pass in the `Authorization: Bearer <token>` header

To generate an API key:

```bash
# Using the NFlow CLI
npx nflow-cli generate-api-key --name="Integration Key" --permissions=read,write

# Or from the admin dashboard
Settings > API Keys > Generate New Key
```

### API Endpoints

#### Document Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents` | GET | List all documents |
| `/api/documents/:id` | GET | Get document details |
| `/api/documents` | POST | Upload new document |
| `/api/documents/:id` | DELETE | Delete a document |

#### Knowledge Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge` | GET | List knowledge bases |
| `/api/knowledge/:id` | GET | Get knowledge base details |
| `/api/knowledge` | POST | Create knowledge base |
| `/api/knowledge/:id/documents` | GET | List documents in knowledge base |

#### Vector Search

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | POST | Search for similar content |

### Example API Usage

#### Uploading a Document

```javascript
// NodeJS example
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function uploadDocument() {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('./document.pdf'));
  formData.append('knowledgeId', 'knowledge-123');
  
  try {
    const response = await axios.post('https://your-nflow-instance.com/api/documents', 
      formData, 
      {
        headers: {
          ...formData.getHeaders(),
          'X-API-Key': 'your-api-key'
        }
      }
    );
    
    console.log('Document uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
}
```

#### Performing a Vector Search

```javascript
// NodeJS example
const axios = require('axios');

async function searchSimilarContent(query, knowledgeId, limit = 5) {
  try {
    const response = await axios.post('https://your-nflow-instance.com/api/search', 
      {
        query,
        knowledgeId,
        limit
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key'
        }
      }
    );
    
    console.log('Search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Search failed:', error.response?.data || error.message);
    throw error;
  }
}
```

## Webhook Integration

NFlow can send event notifications to external systems using webhooks.

### Configuring Webhooks

1. Go to Settings > Webhooks in the NFlow dashboard
2. Click "Add Webhook"
3. Enter the destination URL and select events to subscribe to
4. Save the webhook configuration

### Available Events

- `document.created`: Triggered when a new document is uploaded
- `document.processed`: Triggered when document processing completes
- `knowledge.created`: Triggered when a new knowledge base is created
- `vector.indexed`: Triggered when vectors are indexed
- `search.performed`: Triggered when a search is performed

### Webhook Payload Format

```json
{
  "event": "document.processed",
  "timestamp": "2023-09-18T15:23:45.123Z",
  "data": {
    "id": "doc-123",
    "name": "report.pdf",
    "knowledgeId": "knowledge-456",
    "status": "processed",
    "chunkCount": 42,
    "vectorCount": 42
  }
}
```

### Webhook Security

Webhooks include a signature header `X-NFlow-Signature` that can be used to verify the authenticity of the request. The signature is a HMAC-SHA256 hash of the request body using your webhook secret.

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}
```

## Vector Database Integration

NFlow supports multiple vector database backends. The default is a local SQLite implementation, but for production use, NBase is recommended.

### NBase Integration

1. Set the environment variable: `VECTOR_DB_TYPE=nbase`
2. Configure NBase connection: `NBASE_URL=http://your-nbase-server:1307`
3. Optional: Customize NBase with environment variables:
   - `NBASE_BATCH_SIZE`: Batch size for operations (default: 100)
   - `NBASE_CONNECTION_TIMEOUT`: Connection timeout in ms (default: 5000)

### Custom Vector Database

You can integrate a custom vector database by implementing the VectorDBService interface:

1. Create a new service in `lib/services/customVectorService.ts`
2. Implement the required methods (store, search, delete)
3. Update `vectorSearchService.ts` to use your custom implementation

Example:

```typescript
// lib/services/customVectorService.ts
export async function storeCustomVectors(
  fileId: string,
  knowledgeId: string,
  chunks: {
    id: string;
    content: string;
    metadata: any;
    embedding: number[];
  }[]
): Promise<boolean> {
  // Your custom implementation
}

export async function searchCustomVectors(
  queryVector: number[],
  options?: {
    limit?: number,
    fileId?: string,
    knowledgeId?: string,
  }
): Promise<any[]> {
  // Your custom implementation
}
```

## Embedding Model Integration

NFlow uses OpenAI's embedding models by default, but you can integrate with other embedding providers.

### Custom Embedding Provider

1. Create a new embedding service in `lib/services/customEmbeddingService.ts`
2. Implement the required methods
3. Update embedding configuration in your `.env` file

Example:

```typescript
// lib/services/customEmbeddingService.ts
export async function generateCustomEmbedding(text: string): Promise<{
  embedding: number[];
  tokenCount: number;
}> {
  // Your custom implementation to generate embeddings
  // Must return a compatible embedding format
}
```

## Authentication Integration

NFlow supports various authentication methods including JWT, OAuth, and custom authentication.

### OAuth Integration

To integrate with an OAuth provider:

1. Update `pages/api/auth/[...nextauth].ts` with your provider details
2. Add provider-specific environment variables
3. Implement any custom callbacks needed

Example (Google OAuth):

```typescript
// pages/api/auth/[...nextauth].ts
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Other providers...
  ],
  // Configuration...
});
```

### Custom Authentication

For custom authentication systems:

1. Create a custom authentication handler
2. Implement token validation logic
3. Update API middleware to use your custom authentication

## Custom Extensions

NFlow supports custom extensions to add new functionality.

### Creating a Plugin

1. Create a new directory in `lib/plugins/your-plugin`
2. Implement the plugin interface
3. Register your plugin in `lib/plugins/index.ts`

Example plugin structure:

```
lib/plugins/your-plugin/
├── index.ts           # Main plugin entry point
├── handlers.ts        # Custom API handlers
├── components/        # UI components (if needed)
└── README.md          # Plugin documentation
```

### Extension Points

NFlow provides several extension points:

- **API Extensions**: Add custom API endpoints
- **UI Extensions**: Add custom UI components
- **Processing Extensions**: Add custom document processors
- **Search Extensions**: Add custom search functionality
- **Workflow Extensions**: Add custom workflow actions

See the [Plugin Development Guide](./plugin-development.md) for detailed instructions.

## Troubleshooting Integration Issues

### Common Issues

1. **Authentication Errors**
   - Verify API key or token is valid
   - Check permissions for the API key

2. **Vector Database Connection Issues**
   - Ensure NBase server is running
   - Check network connectivity and firewall settings
   - Verify connection URL is correct

3. **Embedding Generation Errors**
   - Verify OpenAI API key is valid
   - Check rate limits on OpenAI API
   - Ensure text is properly formatted

4. **Webhook Delivery Issues**
   - Ensure destination server is accessible
   - Check webhook URL for correctness
   - Verify your server responds with 2xx status code

### Debugging Tools

1. **API Logs**: Enable detailed logging with `DEBUG=nflow:api:*`
2. **Integration Tests**: Use the provided integration test suite
3. **Health Checks**: Use the `/health` endpoint to verify system status
