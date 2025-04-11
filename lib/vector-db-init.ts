/**
 * Streamlined vector database initialization for Next.js
 */
import { isLocalVectorDBAvailable } from './services/localVectorService';
import { initializeNbase } from './services/nbaseService';
import { VectorDBType } from '../types/vectorDBType';
// Initialization state
let initialized = false;
let vectorDBType: VectorDBType = (process.env.VECTOR_DB_TYPE as VectorDBType) || 'local';

/**
 * Initialize the vector database system
 */
export async function initializeVectorDB() {
  if (typeof window !== 'undefined' || initialized) return;

  console.log(`Initializing vector database system...`);
  const startTime = Date.now();

  try {
    // First check the configured type
    if (vectorDBType === 'nbase') {
      // Try to initialize NBase
      const nbaseAvailable = await initializeNbase();

      if (nbaseAvailable) {
        console.log(`NBase initialized successfully in ${Date.now() - startTime}ms`);
        vectorDBType = 'nbase';
      } else {
        console.log('Falling back to local vector database');
        vectorDBType = 'local';
      }
    } else {
      // Check local vector database
      const localAvailable = await isLocalVectorDBAvailable();
      console.log(`[vector-db-init] Local vector database ${localAvailable ? 'has' : 'does not have'} vectors`);
    }

    // Set the environment variable for other components
    process.env.VECTOR_DB_TYPE = vectorDBType;

    initialized = true;
    console.log(`[vector-db-init] Vector database initialization complete: using ${vectorDBType}`);
  } catch (error) {
    console.error('[vector-db-init] Error initializing vector database:', error);
  }
}

/**
 * Get the current vector database configuration
 */
export function getVectorDBConfig() {
  return {
    type: vectorDBType,
    initialized,
    url: vectorDBType === 'nbase' ? process.env.NBASE_URL || `http://${process.env.NBASE_HOST || 'localhost'}:${process.env.NBASE_PORT || 1307}` : null,
  };
}
