import { prisma } from '../prisma';
// Import parsers for different file types
// Import new utility and service
import { generateEmbeddingsInBatches } from '../services/embeddingService';
import { chunkText, extractChunkMetadata } from '../utils/textChunker';
// Import local vector service, and Nbase service
import { deleteLocalVectors, storeLocalVectors } from '../services/localVectorService';
import { deleteFileVectors as deleteNbaseFileVectors, storeVectorsInNbase as storeNbaseChunkVectors } from '../services/nbaseService';
import { readFileContent } from './parse-file/readFileContent';
import { ConfigChunk } from '@components/knowledge/ChunkSeparatorSelect';
// Remove direct import of SSE sender
// import { sendFileParsingEvent } from '../../pages/api/events/fileParsingEvents';

// Configuration
const POLLING_INTERVAL = parseInt(process.env.PARSING_POLLING_INTERVAL || '5000'); // Default: 5 seconds
const MAX_WORKERS = parseInt(process.env.MAX_PARSING_WORKERS || '3'); // Default: 3 parallel workers
// Configuration for storage batching

// Worker pool management
let isShuttingDown = false;
const activeWorkers = new Map<number, boolean>();
let workerIdCounter = 0;

/**
 * Helper function to create structured task messages
 */
function createTaskMessage(action: string, details?: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  const messageObj = {
    timestamp,
    action,
    ...details,
  };
  return JSON.stringify(messageObj);
}
type ProcessContentIntoVectorsProps = {
  content: string, fileId: string, knowledgeId: string, config: ConfigChunk
}
/**
 * Helper function to send event data to the API endpoint
 */
async function postEventToApi(knowledgeId: string, eventData: any) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/events/sendParsingEvent`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Optional: Add a secret header for security
        // 'X-Internal-Secret': process.env.INTERNAL_WORKER_SECRET || '',
      },
      body: JSON.stringify({ knowledgeId, eventData }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Worker: Failed to post event to API for knowledge ${knowledgeId}. Status: ${response.status}, Body: ${errorBody}`);
    } else {
      console.log(`Worker: Successfully posted event to API for knowledge ${knowledgeId}`);
    }
  } catch (error) {
    console.error(`Worker: Error posting event to API for knowledge ${knowledgeId}:`, error);
  }
}

/**
 * Worker class representing a single parsing worker
 */
class FileParsingWorker {
  id: number;
  isProcessing: boolean = false;

  constructor(id: number) {
    this.id = id;
    console.log(`Worker ${this.id}: Initialized`);
  }

  /**
   * Start the worker processing loop
   */
  async start() {
    console.log(`Worker ${this.id}: Started`);

    while (!isShuttingDown) {
      try {
        // Try to process a pending task
        const processed = await this.processNextTask();

        // If no task was processed, wait before checking again
        if (!processed) {
          await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        }
      } catch (error) {
        console.error(`Worker ${this.id}: Error in processing loop:`, error);
        // Wait before trying again to avoid hammering the database on errors
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      }
    }

    console.log(`Worker ${this.id}: Shutting down`);
    activeWorkers.delete(this.id);
  }

  /**
   * Process the next available pending task
   * Returns true if a task was processed, false otherwise
   */
  async processNextTask(): Promise<boolean> {
    if (this.isProcessing || isShuttingDown) {
      return false;
    }

    this.isProcessing = true;

    try {
      // Attempt to claim a task using a transaction to avoid race conditions
      const task = await prisma.$transaction(async (tx) => {
        // Find the oldest pending task
        const pendingTask = await tx.fileParsingTask.findFirst({
          where: { status: 'pending' },
          orderBy: { createdAt: 'asc' },
          include: { file: true },
        });

        if (!pendingTask) {
          return null;
        }

        // Update it to processing to claim it
        return tx.fileParsingTask.update({
          where: { id: pendingTask.id },
          data: {
            status: 'processing',
            updatedAt: new Date(),
            message: createTaskMessage('processing_started', {
              workerId: this.id,
              fileName: pendingTask.file.originalName,
              fileSize: pendingTask.file.size,
            }),
          },
          include: { file: true },
        });
      });

      // If no task was found or claimed, return false
      if (!task) {
        this.isProcessing = false;
        return false;
      }

      console.log(`Worker ${this.id}: Processing task ${task.id} for file ${task.file.originalName}`);

      // Also update the file's status
      await prisma.file.update({
        where: { id: task.file.id },
        data: { parsingStatus: 'processing' },
      });

      try {
        // Parse the file content
        const fileContent = await readFileContent(task.file.path);

        // Update the task and file as completed
        await this.completeTask(task.id, task.file.id, fileContent);
        console.log(`Worker ${this.id}: Successfully parsed file ${task.file.originalName}`);
      } catch (error: unknown) {
        // Mark the task as failed
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.failTask(task.id, task.file.id, errorMessage);
        console.log(`Worker ${this.id}: Failed to parse file ${task.file.originalName}:`, errorMessage);
      }

      this.isProcessing = false;
      return true;
    } catch (error) {
      console.log(`Worker ${this.id}: Error processing task:`, error);
      this.isProcessing = false;
      return false;
    }
  }



  /**
   * Process text content into chunks and generate vector embeddings
   */
  async processContentIntoVectors({ config: { chunkSeparator, tokenChunk }, content, fileId, knowledgeId }: ProcessContentIntoVectorsProps): Promise<void> {
    try {



      console.log(`Worker ${this.id}: Processing content into chunks with tokenChunk=${tokenChunk}, separator=${JSON.stringify(chunkSeparator)}`);

      // Extract text content from parsed result if it's in JSON format
      let textContent = content;
      try {
        const parsedContent = JSON.parse(content);
        if (parsedContent.text) {
          // Word document format
          textContent = parsedContent.text;
        } else if (parsedContent.markdown) {
          // Markdown format
          textContent = parsedContent.markdown;
        } else if (typeof parsedContent === 'object') {
          // Attempt to stringify object-like content
          textContent = JSON.stringify(parsedContent);
        }
      } catch (_e) {
        console.log(`Worker ${this.id}: Content is not JSON, using as-is`);
      }

      // Split content into chunks
      const chunks = chunkText(textContent, chunkSeparator, tokenChunk);
      console.log(`Worker ${this.id}: Split content into ${chunks.length} chunks`);

      // Generate embeddings for chunks (in batches to avoid rate limits)
      const embedding = await generateEmbeddingsInBatches(chunks); // Changed variable name for clarity

      // Determine which vector storage to use
      const vectorDBType = process.env.VECTOR_DB_TYPE || 'local';

      // Prepare chunks with embeddings for storage
      const vectorChunks = chunks.map((chunk, index) => ({
        id: `${fileId}_chunk_${index}`,
        content: chunk,
        metadata: extractChunkMetadata(chunk, index),
        embedding: embedding[index].embedding, // Use embeddingResponses
      }));

      // Delete existing vectors first
      console.log(`Worker ${this.id}: Deleting existing vectors for file ${fileId} using ${vectorDBType}`);
      switch (vectorDBType) {
        case 'nbase':
          await deleteNbaseFileVectors(fileId);
          break;
        default: // 'local'
          await deleteLocalVectors(fileId);
          break;
      }
      console.log(`Worker ${this.id}: Existing vectors deleted for file ${fileId}`);

      const STORAGE_BATCH_SIZE = 5 // Default: 100 chunks per batch

      // Store new vectors in batches
      console.log(`Worker ${this.id}: Storing ${vectorChunks.length} vectors in batches of ${STORAGE_BATCH_SIZE} using ${vectorDBType}`);

      for (let i = 0; i < vectorChunks.length; i += STORAGE_BATCH_SIZE) {
        const batch = vectorChunks.slice(i, i + STORAGE_BATCH_SIZE);
        console.log(`Worker ${this.id}: Storing batch ${i / STORAGE_BATCH_SIZE + 1} (size: ${batch.length})`);

        switch (vectorDBType) {
          case 'nbase':
            await storeNbaseChunkVectors(fileId, knowledgeId, batch);
            break;

          default: // 'local'
            await storeLocalVectors(fileId, knowledgeId, batch);
            break;
        }
        // Optional: Add a small delay between batches if needed for rate limiting the storage service
        // await new Promise(resolve => setTimeout(resolve, 200));
      }


      console.log(`Worker ${this.id}: Successfully stored ${vectorChunks.length} text chunks with embeddings`);
    } catch (error) {
      console.error(`Worker ${this.id}: Error processing content into vectors:`, error);
      throw error;
    }
  }

  /**
   * Mark a task as completed and update the file with content
   */
  async completeTask(taskId: string, fileId: string, content: string) {
    // Determine the content type based on structure
    let contentType = 'text';
    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent.markdown && parsedContent.html) {
        contentType = 'markdown';
      } else if (parsedContent.text && Array.isArray(parsedContent.warnings)) {
        contentType = 'docx';
      } else if (Object.keys(parsedContent).length > 0 && Array.isArray(Object.values(parsedContent)[0])) {
        contentType = 'xlsx';
      }
    } catch (e) {
      // Not JSON, must be plain text
      console.log(`Worker ${this.id}: Content is not JSON, defaulting to text`, e);
      contentType = 'text';
    }

    // Use Record<string, any> to allow adding dynamic properties
    const messageDetails: Record<string, any> = {
      contentType,
      contentSize: content.length,
      workerId: this.id,
    };

    // Get file configuration
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { config: true, knowledgeId: true, originalName: true },
    });


    // Process into vectors if possible
    try {
      if (file && file.knowledgeId) {
        console.log(`config chunk`, JSON.stringify(file.config, null, 2));
        let config: ConfigChunk = {
          chunkSeparator: [`\n`],
          tokenChunk: 128
        }
        try {
          config = JSON.parse(`${file.config}`)
        }
        catch {

        }
        await this.processContentIntoVectors({
          content, fileId, knowledgeId: file.knowledgeId, config: config

        });

        // Add vector processing success to message
        messageDetails.vectorProcessing = 'success';
        messageDetails.fileName = file.originalName;

        // For SQLite, perform updates separately to avoid transaction size limitations
        await prisma.fileParsingTask.update({
          where: { id: taskId },
          data: {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date(),
            message: createTaskMessage('task_completed', messageDetails),
          },
        });

        const updatedFile = await prisma.file.update({
          where: { id: fileId },
          data: {
            parsingStatus: 'completed',
            content: content,
          },
        });

        // Send SSE event via API endpoint
        console.log(`Worker ${this.id}: Preparing to send completed event via API for file ${updatedFile.filename} in knowledge ${file.knowledgeId}`);
        const eventData = {
          type: 'status-change',
          fileId,
          knowledgeId: file.knowledgeId,
          status: 'completed',
          fileName: file.originalName,
          timestamp: new Date().toISOString(),
        };
        await postEventToApi(file.knowledgeId, eventData); // Use the helper function

      } else {
        throw new Error('File not found or has no knowledge ID');
      }
    } catch (error: any) {
      console.error(`Worker ${this.id}: Vector processing failed:`, error);

      // Still mark the task as completed, but note the vector generation failure
      messageDetails.vectorProcessing = 'failed';
      messageDetails.errorMessage = error.message;
      if (file) messageDetails.fileName = file.originalName;

      await prisma.$transaction([
        prisma.fileParsingTask.update({
          where: { id: taskId },
          data: {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date(),
            message: createTaskMessage('task_completed_with_errors', messageDetails),
          },
        }),
        prisma.file.update({
          where: { id: fileId },
          data: {
            parsingStatus: 'completed',
            content: content,
          },
        }),
      ]);

      // Send SSE event even in case of partial failure via API endpoint
      if (file && file.knowledgeId) {
        console.log(`Worker ${this.id}: Preparing to send completed (with errors) event via API for file ${fileId} in knowledge ${file.knowledgeId}`);
        const eventData = {
          type: 'status-change',
          fileId,
          knowledgeId: file.knowledgeId,
          status: 'completed',
          fileName: file.originalName,
          hasErrors: true,
          errorSummary: error.message?.substring(0, 100),
          timestamp: new Date().toISOString(),
        };
        await postEventToApi(file.knowledgeId, eventData); // Use the helper function
      }
    }
  }

  /**
   * Mark a task as failed
   */
  async failTask(taskId: string, fileId: string, errorMessage: string) {
    // Use Record<string, any> here too
    const messageDetails: Record<string, any> = {
      workerId: this.id,
      errorMessage,
    };

    let knowledgeId = null;
    try {
      // Try to get file info for better error messages
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: { originalName: true, knowledgeId: true },
      });

      if (file) {
        messageDetails.fileName = file.originalName;
        knowledgeId = file.knowledgeId;
      }
    } catch (e) {
      // Ignore errors when fetching file info
      console.log(`Worker ${this.id}: Error fetching file info for failure message:`, e);

    }

    await prisma.$transaction([
      prisma.fileParsingTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          message: createTaskMessage('task_failed', messageDetails),
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.file.update({
        where: { id: fileId },
        data: {
          parsingStatus: 'failed',
        },
      }),
    ]);

    // Send SSE event for file failure via API endpoint
    if (knowledgeId) {
      console.log(`Worker ${this.id}: Preparing to send failed event via API for file ${fileId} in knowledge ${knowledgeId}`);
      const eventData = {
        type: 'status-change',
        fileId,
        knowledgeId,
        status: 'failed',
        fileName: messageDetails.fileName,
        errorMessage: messageDetails.errorMessage,
        timestamp: new Date().toISOString(),
      };
      await postEventToApi(knowledgeId, eventData); // Use the helper function
    }
  }
}

/**
 * Start the worker pool with multiple workers
 */
export async function startFileParsingWorker() {
  console.log(`Starting file parsing worker pool with ${MAX_WORKERS} workers`);

  // Reset shutdown flag
  isShuttingDown = false;

  // Create and start workers
  for (let i = 0; i < MAX_WORKERS; i++) {
    const workerId = ++workerIdCounter;
    const worker = new FileParsingWorker(workerId);

    // Register the worker
    activeWorkers.set(workerId, true);

    // Start the worker (non-blocking)
    worker.start().catch((error) => {
      console.error(`Error in worker ${workerId}:`, error);
      activeWorkers.delete(workerId);
    });
  }

  console.log(`Worker pool started with ${activeWorkers.size} workers`);
}

/**
 * Stop all workers gracefully
 */
export function stopFileParsingWorker() {
  console.log('Stopping file parsing worker pool...');
  isShuttingDown = true;

  // Return a promise that resolves when all workers have stopped
  return new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      if (activeWorkers.size === 0) {
        clearInterval(checkInterval);
        console.log('All workers stopped');
        resolve();
      }
    }, 100);

    // Force resolve after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log(`Force stopping with ${activeWorkers.size} workers still active`);
      resolve();
    }, 10000);
  });
}
