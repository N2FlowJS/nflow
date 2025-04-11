import { IChunk } from "../../types/IChunk";
import { prisma } from "../prisma";

/**
 * Simple in-memory vector similarity calculation using cosine similarity
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector dimensions don't match: ${vecA.length} vs ${vecB.length}`);
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Store vector data in SQLite by serializing it
 */
export async function storeLocalVectors(
  fileId: string,
  knowledgeId: string,
  chunks: {
    id: string,
    content: string,
    metadata: any,
    embedding: number[]
  }[]
): Promise<boolean> {
  try {
    console.log(`Storing ${chunks.length} vectors in local SQLite database`);
    
    // Store chunks in batches to avoid SQLite limitations
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((chunk, idx) => {
        const index = i + idx;
        return prisma.textChunk.create({
          data: {
            fileId: fileId,
            content: chunk.content,
            chunkIndex: index,
            metadata: chunk.metadata,
            vectorData: JSON.stringify(chunk.embedding) // Serialize the vector as JSON
          }
        });
      });
      
      await Promise.all(batchPromises);
      console.log(`Stored vector batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)}`);
    }
    
    console.log(`Successfully stored ${chunks.length} vectors in SQLite`);
    return true;
  } catch (error) {
    console.error('Error storing vectors in SQLite:', error);
    return false;
  }
}

/**
 * Delete vectors for a specific file from SQLite
 */
export async function deleteLocalVectors(fileId: string): Promise<boolean> {
  try {
    await prisma.textChunk.deleteMany({
      where: { fileId }
    });
    console.log(`Deleted all vectors for file ${fileId} from SQLite`);
    return true;
  } catch (error) {
    console.error(`Error deleting vectors for file ${fileId} from SQLite:`, error);
    return false;
  }
}

/**
 * Search for similar content using vector similarity in SQLite
 * This is a memory-intensive operation as we load vectors and compute similarity in-memory
 */
export async function searchLocalVectors(
  queryVector: number[],
  options?: {
    limit?: number,
    fileId?: string,
    knowledgeId?: string,
    similarityThreshold?: number
  }
): Promise<any[]> {
  try {
    const limit = options?.limit || 5;
    const threshold = options?.similarityThreshold || 0.7;
    
    // Build where clause for SQLite
    const where: any = {};
    
    if (options?.fileId) {
      where.fileId = options.fileId;
    } else if (options?.knowledgeId) {
      where.file = {
        knowledgeId: options.knowledgeId
      };
    }
    
    // We need to load chunks with vector data
    const chunks = await prisma.textChunk.findMany({
      where,
      include: {
        file: {
          select: {
            id: true,
            originalName: true,
            knowledgeId: true
          }
        }
      }
    });
    
    // Compute similarity for each chunk - this happens in memory
    const results = chunks
      .filter(chunk => chunk.vectorData) // Only process chunks with vector data
      .map(chunk => {
        try {
          const vectorData = JSON.parse(chunk.vectorData || '[]');
          const similarity = cosineSimilarity(queryVector, vectorData);
          
          return {
            id: chunk.id,
            content: chunk.content,
            fileId: chunk.fileId,
            fileName: chunk.file.originalName,
            knowledgeId: chunk.file.knowledgeId,
            similarity,
            metadata: chunk.metadata
          };
        } catch (e) {
          console.error(`Error processing vector for chunk ${chunk.id}:`, e);
          return null;
        }
      })
      .filter(result => result !== null && result.similarity >= threshold)
      .sort((a, b) => b!.similarity - a!.similarity) // Sort by similarity descending
      .slice(0, limit);
      
    console.log(`Local vector search found ${results.length} results above threshold ${threshold}`);
    return results as any[];
  } catch (error) {
    console.error('Error searching local vectors:', error);
    return [];
  }
}

/**
 * Check if the local vector database is available and contains vectors
 */
export async function isLocalVectorDBAvailable(): Promise<boolean> {
  try {
    // Check if TextChunk table exists and has at least one entry with vector data
    const count = await prisma.textChunk.count({
      where: {
        vectorData: {
          not: null
        }
      }
    });
    
    return count > 0;
  } catch (error) {
    console.error('Error checking local vector DB availability:', error);
    return false;
  }
}

/**
 * Get statistics about the local vector database
 */
export async function getLocalVectorStats(): Promise<{
  totalVectors: number,
  filesWithVectors: number,
  averageVectorsPerFile: number
}> {
  try {
    const totalVectors = await prisma.textChunk.count({
      where: {
        vectorData: {
          not: null
        }
      }
    });
    
    const filesWithVectors = await prisma.file.count({
      where: {
        TextChunk: {
          some: {
            vectorData: {
              not: null
            }
          }
        }
      }
    });
    
    const averageVectorsPerFile = filesWithVectors > 0 ? totalVectors / filesWithVectors : 0;
    
    return {
      totalVectors,
      filesWithVectors,
      averageVectorsPerFile
    };
  } catch (error) {
    console.error('Error getting local vector stats:', error);
    return {
      totalVectors: 0,
      filesWithVectors: 0,
      averageVectorsPerFile: 0
    };
  }
}

/**
 * Fetch all text chunks for a specific file from SQLite
 */
export async function fetchTextChunksByFileId(fileId: string): Promise<IChunk[]> {
  try {
    console.log(`Fetching text chunks for file ID: ${fileId} from SQLite`);
    
    const chunks = await prisma.textChunk.findMany({
      where: { fileId },
      include: {
        file: {
          select: {
            id: true,
            originalName: true,
            knowledgeId: true
          }
        }
      },
      orderBy: {
        chunkIndex: 'asc'
      }
    });
    
    console.log(`Successfully fetched ${chunks.length} chunks for file ID: ${fileId}`);
    
    return chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      fileId: chunk.fileId,
      fileName: chunk.file.originalName,
      knowledgeId: chunk.file.knowledgeId,
      metadata: chunk.metadata
    }));
  } catch (error) {
    console.error(`Error fetching text chunks for file ID: ${fileId} from SQLite:`, error);
    return [];
  }
}
