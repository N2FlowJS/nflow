/**
 * Simplified NBase service using the new server API
 */
import { startNbaseServer } from '../nbase-init';
import { log } from '../../utils/logger';

// Core configuration with sensible defaults
const NBASE_HOST = process.env.NBASE_HOST || 'localhost';
const NBASE_PORT = process.env.NBASE_PORT || '1307';
const NBASE_URL = process.env.NBASE_URL || `http://${NBASE_HOST}:${NBASE_PORT}`;

/**
 * Initialize the NBase vector database using the simplified API
 */
export async function initializeNbase(): Promise<boolean> {
  log('info', '🚀 Initializing NBase vector database...');

  try {
    // Start the NBase server with simplified API
    const serverStarted = await startNbaseServer();

    if (!serverStarted) {
      log('warn', '⚠️ Failed to start NBase server. Check the server logs for details.');
      return false;
    }

    // Test server connection with a healthcheck
    const serverUrl = `${NBASE_URL}/health`;
    log('info', `🔍 Testing NBase connection at ${serverUrl}...`);

    const response = await fetch(serverUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      log('warn', `⚠️ NBase health check failed: ${response.status} ${response.statusText}`);
      return false;
    }

    log('info', '✅ NBase connection successful');
    return true;
  } catch (error) {
    log('error', '❌ Error initializing NBase:', error);
    return false;
  }
}

/**
 * Search for similar content using NBase vector database
 * @param vector - The query vector to search with
 * @param filter - Optional filter criteria
 * @param limit - Maximum number of results to return
 * @returns Array of search results
 */
export async function searchSimilarContent(vector: number[], filter?: any, limit: number = 5): Promise<any[]> {
  try {
    console.log(`Searching NBase with filter:`, filter || 'none');

    // Prepare the search API endpoint
    const searchUrl = `${NBASE_URL}/api/search`;

    // Define interface for search request to properly include filters
    interface SearchRequest {
      query: number[]; // Changed from 'vector' to 'query' to match API spec
      k: number;
      includeMetadata: boolean;
      includeVectors: boolean;
      filters?: any; // Optional filters property
    }

    // Prepare the search request with proper typing
    const searchRequest: SearchRequest = {
      query: vector, // Changed from 'vector' to 'query' to match API spec
      k: limit,
      includeMetadata: true,
      includeVectors: false,
    };

    // Add filters if provided
    if (filter) {
      searchRequest.filters = filter;
    }

    // Execute the search request
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Check specifically for dimension mismatch errors
      if (errorText.includes('dimension mismatch')) {
        console.error('Vector dimension mismatch detected in search request');

        // Get the expected dimension from error message if possible
      }

      console.error(`NBase search failed: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const result = await response.json();
  console.log(`NBase search response:`, result);
  
    // Format the results to match the expected structure
    if (!result.results || !Array.isArray(result.results)) {
      console.warn('NBase returned unexpected response format:', result);
      return [];
    }

    // Transform NBase results to match application format
    const formattedResults = result.results.map((item: any) => ({
      id: item.id,
      content: item.metadata?.content || '',
      fileId: item.metadata?.fileId || '',
      fileName: item.metadata?.fileName || '',
      knowledgeId: item.metadata?.knowledgeId || '',
      similarity: 1 - (item.dist || 0), // Convert distance to similarity score
      metadata: item.metadata || {},
    }));

    console.log(`NBase search returned ${formattedResults.length} results`);
    return formattedResults;
  } catch (error) {
    console.error('Error searching NBase:', error);
    return [];
  }
}

/**
 * Store vector data in NBase database
 * @param fileId - File ID associated with the vectors
 * @param knowledgeId - Knowledge ID associated with the vectors
 * @param chunks - Array of text chunks with embeddings
 * @returns Success status
 */
export async function storeVectorsInNbase(
  fileId: string,
  knowledgeId: string,
  chunks: {
    id: string;
    content: string;
    metadata: any;
    embedding: number[];
  }[]
): Promise<boolean> {
  try {
    console.log(`Storing ${chunks.length} vectors in NBase database`);

    // Check if there's a dimension mismatch with environment variable

    // Prepare vectors in NBase format
    const vectors = chunks.map((chunk) => ({
      id: chunk.id,
      vector: chunk.embedding,
      metadata: {
        ...chunk.metadata,
        content: chunk.content,
        fileId,
        knowledgeId,
      },
    }));
    console.log(JSON.stringify(vectors, null, 2));

    const response = await fetch(`${NBASE_URL}/api/vectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vectors }),
      signal: AbortSignal.timeout(30000), // 30 second timeout for larger batches
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to store vectors in NBase: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    const result = await response.json();
    if (result.success) console.log(`Successfully stored vectors in NBase`);
    return true;
  } catch (error) {
    console.error('Error storing vectors in NBase:', error);
    return false;
  }
}

/**
 * Delete all vectors associated with a specific file
 * @param fileId - File ID whose vectors should be deleted
 * @returns Success status
 */
export async function deleteFileVectors(fileId: string): Promise<boolean> {
  try {
    log('info', `🗑️ Deleting vectors for file ID: ${fileId} from NBase`);

    // Fix the endpoint URL for vector deletion - use the correct endpoint
    const deleteUrl = `${NBASE_URL}/api/vectors/filter`;

    // Create filter to match all vectors with this fileId in metadata
    const filter = {
      metadata: {
        fileId: fileId,
      },
    };

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `❌ Failed to delete vectors from NBase: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    const result = await response.json();
    log('info', `✅ Successfully deleted ${result.deleted || 0} vectors for file ID: ${fileId} from NBase`);
    return true;
  } catch (error) {
    log('error', `❌ Error deleting vectors for file ID: ${fileId} from NBase:`, error);
    return false;
  }
}

/**
 * Get vector stats for files in the NBase database
 * @returns Statistics object or null on error
 */
export async function getFileVectorStats(): Promise<any> {
  try {
    // Updated to match API documentation
    const statsUrl = `${NBASE_URL}/stats`;

    const response = await fetch(statsUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.error(`Failed to get NBase stats: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting NBase vector stats:', error);
    return null;
  }
}

/**
 * Get all chunks for a specific file using the metadata endpoint
 * @param fileId - The ID of the file whose chunks to retrieve
 * @returns Array of chunks or empty array on error
 */
export async function getFileChunks(fileId: string): Promise<any[]> {
  try {
    log('info', `📄 Fetching chunks for file ID: ${fileId} from NBase`);

    // Use the metadata endpoint to get chunks by file ID
    const metadataUrl = `${NBASE_URL}/api/search/metadata`;

    const response = await fetch(metadataUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        criteria: { fileId: fileId },
        includeVectors: false,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `❌ Failed to fetch chunks from NBase: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const result = await response.json();

    if (!result.results || !Array.isArray(result.results)) {
      log('warn', '⚠️ NBase metadata search returned unexpected format:', result);
      return [];
    }

    // Format the results
    const chunks = result.results.map((item: any) => ({
      id: item.vectorId,
      content: item.metadata?.content || '',
      chunkIndex: item.metadata?.chunkIndex || 0,
      fileId: item.metadata?.fileId || fileId,
      metadata: item.metadata || {},
      partitionId: item.partitionId,
    }));

    log('info', `✅ Successfully fetched ${chunks.length} chunks for file ID: ${fileId}`);
    return chunks;
  } catch (error) {
    log('error', `❌ Error fetching chunks for file ID: ${fileId}:`, error);
    return [];
  }
}
