import { prisma } from '../prisma';
import { generateEmbedding } from './embeddingService';
import { searchLocalVectors } from './localVectorService';
import { searchSimilarContent as searchNbase } from './nbaseService';

export type SearchSimilarResult = {
  content: string;
  fileId: string;
  fileName: string;
  id: string;
  similarity: number; // Similarity score between 0 and 1
  knowledgeId: string;
  metadata: {
    charCount: number;
    chunkIndex: number;
    content: string;
    createdAt: number;
    dimension: number;
    estimatedTokenCount: number;
    fileId: string;
    heading: string;
    knowledgeId: string;
  };
};
/**
 * Search for similar content using the best available vector database
 */
export async function searchSimilarContent(
  query: string,
  options?: {
    limit?: number;
    fileId?: string;
    knowledgeId?: string;
    similarityThreshold?: number; // Expose threshold parameter
  }
): Promise<{
  timestamp: number;
  results: SearchSimilarResult[];
  error?: string;
}> {
  try {
    const startAt = new Date().getTime();
    const limit = options?.limit || 5;
    const similarityThreshold = options?.similarityThreshold || 0.7;

    // Generate embedding for the query
    const queryEmbeddingResult = await generateEmbedding(query);

    // Create filter for vector search
    const filter: any = {};
    if (options?.fileId) filter.fileId = options.fileId;
    if (options?.knowledgeId) filter.knowledgeId = options.knowledgeId;

    // Determine which vector database to use
    const vectorDBType = process.env.VECTOR_DB_TYPE || 'local';
    let results: any[] = [];

    // Try vector search using the appropriate method
    console.log(`Using ${vectorDBType} for vector search`);

    switch (vectorDBType) {
      case 'nbase':
        console.log('Performing Nbase search with filters:', filter);
        results = await searchNbase(queryEmbeddingResult.embedding, Object.keys(filter).length > 0 ? filter : undefined, limit);
        break;

      default: // 'local'
        console.log('Performing local vector search with filters:', filter);
        results = await searchLocalVectors(queryEmbeddingResult.embedding, {
          limit,
          fileId: options?.fileId,
          knowledgeId: options?.knowledgeId,
          similarityThreshold, // Pass the threshold parameter
        });
        break;
    }

    // If no results, fall back to keyword search
    if (results.length === 0) {
      console.log('No vector search results, falling back to keyword search');
      return fallbackToKeywordSearch(query, options);
    }

    console.log(`Vector search found ${results.length} results using ${vectorDBType}`);
    return {
      timestamp: new Date().getTime() - startAt,
      results,
    };
  } catch (error) {
    console.error('Error in vector search:', error);
    return fallbackToKeywordSearch(query, options);
  }
}

/**
 * Fallback to keyword search when vector search fails
 */
async function fallbackToKeywordSearch(
  query: string,
  options?: {
    limit?: number;
    fileId?: string;
    knowledgeId?: string;
  }
): Promise<{
  timestamp: number;
  results: SearchSimilarResult[];
  error?: string;
}> {
  const limit = options?.limit || 5;

  // Build where clause for SQLite (simpler query without text search capabilities)
  const where: any = {};
  if (options?.fileId) where.fileId = options?.fileId;

  // For SQLite, use LIKE for simple text matching
  // Note: This is less efficient than proper text search but works with SQLite
  try {
    // First get file IDs by knowledge ID if needed
    let fileIds: string[] = [];
    if (options?.knowledgeId) {
      const files = await prisma.file.findMany({
        where: { knowledgeId: options.knowledgeId },
        select: { id: true },
      });
      fileIds = files.map((f) => f.id);

      if (fileIds.length > 0) {
        where.fileId = { in: fileIds };
      } else {
        return {
          timestamp: new Date().getTime(),
          results: [],
          error: 'No files found for this knowledge ID',
        }; // No files found for this knowledge ID
      }
    }

    // For SQLite, use raw query for text search since it doesn't support complex text search
    const chunks = await prisma.textChunk.findMany({
      where: {
        ...where,
        content: {
          contains: query,
        },
      },
      take: limit,
      orderBy: { chunkIndex: 'asc' },
      include: {
        file: {
          select: {
            id: true,
            originalName: true,
            knowledgeId: true,
          },
        },
      },
    });

    // Format results similar to vector search
    return {
      timestamp: new Date().getTime(),
      results: chunks.map((chunk) => ({
        content: chunk.content,
        fileId: chunk.fileId,
        fileName: chunk.file.originalName,
        id: chunk.id,
        similarity:0, // Not applicable for keyword search
        knowledgeId: chunk.file.knowledgeId,
        metadata: {
          charCount: chunk.content.length,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          createdAt: new Date(chunk.createdAt).getTime(),
          dimension: 0, // Not applicable for keyword search
          estimatedTokenCount: Math.ceil(chunk.content.length / 4), // Rough estimate
          fileId: chunk.fileId,
          heading: '', // Not applicable for keyword search
          knowledgeId: chunk.file.knowledgeId,
        },
      })),
    };
  } catch (error) {
    console.error('Error in fallback search:', error);
    return {
      timestamp: new Date().getTime(),
      results: [],
      error: 'Error performing fallback search',
    };
  }
}
