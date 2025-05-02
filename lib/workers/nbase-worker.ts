'use server'
/**
 * Streamlined vector database initialization for Next.js
 */
import { log } from '../../utils/logger';
import fs from 'fs'; // Added import
import path from 'path'; // Added import

// Server state tracking
let serverType: string | null = null; // Track server type
let nbaseReady: boolean = false;
// Status file path
const STATUS_FILE = path.resolve(process.cwd(), "logs", 'nbase-worker.json');

/**
 * Write current status to the JSON file
 */
function writeStatusToFile() {
  const status = {
    enabled: nbaseReady,
    status: nbaseReady ? 'running' : 'stopped',
    serverType: serverType,
    lastUpdated: new Date().toISOString(),
  };
  try {
    // Ensure logs directory exists
    const logDir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
  } catch (err) {
    log('error', '[NBaseWorker] Error writing status file:', err);
  }
}

/**
 * Read status from the JSON file
 */
function readStatusFromFile() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const raw = fs.readFileSync(STATUS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    log('error', '[NBaseWorker] Error reading status file:', err);
  }
  // Default status if file doesn't exist or is invalid
  return {
    enabled: false,
    status: 'stopped',
    pid: null,
    serverType: null,
    lastUpdated: undefined,
  };
}

/**
 * Initialize and start the NBase server process - simplified version
 */
export async function startNbaseServer(): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.warn('NBase server can only be started in a server environment');
    return false;
  }

  serverType = 'nbase'


  if (process.env.VECTOR_DB_TYPE !== 'nbase') {
    log('info', '🔵 NBase not needed - using a different vector database local');
    return true;
  }



  log('info', '🚀 Starting NBase server...');
  try {
    log('info', '🔄 Starting NBase server in-process...');


    // Wait for server to be ready
    const serverUrl = `${process.env.NBASE_URL}/health`;
    nbaseReady = await waitForServerReady(serverUrl);
    if (nbaseReady) writeStatusToFile(); // Update status on success
    return nbaseReady;

  } catch (error: unknown) {
    log('error', '❌ Error starting NBase:', error instanceof Error ? error.message : String(error));
    writeStatusToFile(); // Update status even on failure (to show stopped)
    return false;
  }
}

/**
 * Wait for server to be ready with optimized polling
 */
async function waitForServerReady(url: string): Promise<boolean> {
  const MAX_ATTEMPTS = 10;
  const RETRY_DELAY = 500;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      log('info', `🔄 Checking if NBase is ready (attempt ${attempt + 1}/${MAX_ATTEMPTS})...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        log('info', '✅ NBase server is ready!');
        return true;
      }
    } catch {
      // Continue trying
      log('debug', `🔄 NBase not ready yet, retrying in ${RETRY_DELAY}ms...`);
    }

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  log('error', '❌ NBase server failed to respond after maximum attempts');
  return false;
}

/**
 * Stop the NBase server 
 */
export async function stopNbaseServer(): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return;
  }


}
// Initialization state
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




    writeStatusToFile()
    log('info', '✅ NBase connection successful');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log('error', '❌ Error initializing NBase:', error.message);
    } else {
      log('error', '❌ Error initializing NBase:', String(error));
    }
    return false;
  }
}

/**
 * Get NBase worker status from file
 */
export function getNbaseWorkerStatus() {
  return readStatusFromFile();
}
