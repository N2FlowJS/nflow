import { startFileParsingWorker, stopFileParsingWorker } from './workers/fileParsingWorker';
import { isLocalVectorDBAvailable } from './services/localVectorService';
import { initializeNbase } from './services/nbaseService';
import { stopNbaseServer } from './nbase-init';
import { VectorDBType } from '../types/vectorDBType';

// Worker state
let workerStarted = false;
let vectorDBType: 'nbase' | 'local' = process.env.VECTOR_DB_TYPE as 'nbase' | 'local';

/**
 * Initialize all workers and services
 */
export async function initializeWorker() {
  console.log('Initializing workers and services...');

  // Only run on server side
  if (typeof window !== 'undefined') {
    return;
  }

  // Avoid duplicate initialization
  if (workerStarted) {
    return;
  }

  // Check if worker is enabled
  if (process.env.ENABLE_FILE_PARSING_WORKER === 'true') {
    console.log('> Initializing file parsing worker...');

    try {
      // Check vector database options with optimized flow
      console.log('> Checking vector database options...');

      // Check for environment override
      const envVectorDBType = process.env.VECTOR_DB_TYPE?.toLowerCase() as VectorDBType;

      // Use environment setting if explicitly provided, otherwise use the default
      if (envVectorDBType) {
        vectorDBType = envVectorDBType;
        console.log(`> Using vector database type from environment: ${vectorDBType}`);
      }

      // First try to initialize NBase if that's our selected type
      if (vectorDBType === 'nbase') {
        console.log('> Attempting to initialize NBase vector database...');

        // Initialize NBase with optimized retry logic and better error handling
        const nbaseStartTime = Date.now();
        try {
          const nbaseAvailable = await initializeNbase();
          const nbaseInitTime = Date.now() - nbaseStartTime;

          if (nbaseAvailable) {
            console.log(`> NBase server initialized successfully in ${nbaseInitTime}ms for storing embeddings.`);
            vectorDBType = 'nbase';
          } else {
            console.log(`> Failed to initialize NBase server after ${nbaseInitTime}ms. Falling back to local vector storage.`);
            vectorDBType = 'local';
          }
        } catch (error) {
          console.error(`> NBase initialization error:`, error);
          console.log(`> Falling back to local vector storage due to error.`);
          vectorDBType = 'local';
        }
      } else {
        // Check local vector database
        console.log('> Checking local vector database...');
        const localStartTime = Date.now();
        const localDBAvailable = await isLocalVectorDBAvailable();
        const localCheckTime = Date.now() - localStartTime;

        if (localDBAvailable) {
          console.log(`> Local vector database check completed in ${localCheckTime}ms. Found existing vectors.`);
          vectorDBType = 'local';
        } else {
          console.log(`> Local vector database check completed in ${localCheckTime}ms. No existing vectors found.`);
          vectorDBType = 'local';
        }
      }

      // Store vector DB type in environment for other components to access
      process.env.VECTOR_DB_TYPE = vectorDBType;
      console.log(`> Vector database type set to: ${vectorDBType.toUpperCase()}`);

      // Start file parsing workers
      console.log('> Starting file parsing workers...');
      const workerStartTime = Date.now();
      await startFileParsingWorker();
      console.log(`> Workers started in ${Date.now() - workerStartTime}ms`);

      workerStarted = true;

      // Register cleanup handler
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      console.log(`> Worker initialization complete. Using ${vectorDBType.toUpperCase()} vector database for storing embeddings`);
    } catch (error) {
      console.error('> Failed to initialize worker:', error);
    }
  } else {
    console.log('> Worker disabled via environment variable');
  }

  console.log('Workers and services initialization complete');
}

/**
 * Clean up worker resources on shutdown
 */
async function cleanup() {
  console.log('Shutting down workers and services...');

  if (workerStarted) {
    console.log('> Stopping worker on shutdown...');
    await stopFileParsingWorker();
    workerStarted = false;
    console.log('> Worker stopped');
  }

  // Stop Nbase server if it was started
  if (process.env.VECTOR_DB_TYPE === 'nbase') {
    await stopNbaseServer();
  }

  console.log('Workers and services shutdown complete');
}

// Export for API routes
export const getWorkerStatus = () => ({
  initialized: workerStarted,
  workerCount: parseInt(process.env.MAX_PARSING_WORKERS || '3'),
  vectorDBType,
});
