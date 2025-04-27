'use server'
/**
 * Streamlined vector database initialization for Next.js
 */
import * as nbaseService from '../services/nbaseService';
// Import necessary modules
import { log } from '@utils/logger';
import fs from 'fs'; // Added import
import path from 'path'; // Added import
type ChildProcess = any;

// Server state tracking
let nbaseProcess: ChildProcess | null = null;
let directServerInstance: any = null;
let serverType: 'direct' | 'external' | null = null; // Track server type

// Status file path
const STATUS_FILE = path.resolve(process.cwd(), "logs", 'nbase-worker.json');

/**
 * Write current status to the JSON file
 */
function writeStatusToFile() {
  const status = {
    enabled: !!(nbaseProcess || directServerInstance),
    status: nbaseProcess || directServerInstance ? 'running' : 'stopped',
    pid: nbaseProcess?.pid || (directServerInstance ? process.pid : null),
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

  const NBASE_DB_PATH = `${process.env.NBASE_DB_PATH}`
  console.log(`NBASE_DB_PATH`, NBASE_DB_PATH);

  // Early returns for common cases
  if (nbaseProcess?.pid || directServerInstance) {
    log('info', '🟢 NBase server already running');
    // Ensure status file is up-to-date even if already running
    writeStatusToFile();
    return true;
  }

  if (process.env.VECTOR_DB_TYPE !== 'nbase') {
    log('info', '🔵 NBase not needed - using a different vector database local');
    return true;
  }

  if (process.env.NODE_ENV === 'production') {
    log('info', '🔵 NBase embedded server not used in production');
    return true;
  }

  log('info', '🚀 Starting NBase server...');

  try {
    // Dynamically import Node.js modules
    const { spawn } = await import('child_process');
    const path = await import('path');
    const { existsSync } = await import('fs');

    // Find the NBase directory
    const basePath = process.cwd()
    const nbasePath = path.join(basePath, 'node_modules', '@n2flowjs', 'nbase');
    log('debug', `📁 NBase path: ${process.cwd()} - ${nbasePath}`);

    // Check if NBase exists
    if (!existsSync(nbasePath)) {
      log('error', '❌ NBase directory not found');
      return false;
    }

    // Check if we're running in Next.js environment
    const isNextJsEnvironment = process.cwd().includes('.next') ||
      __dirname.includes('.next') ||
      !!process.env.NEXT_RUNTIME;

    // Skip in-process approach for Next.js environment as it has issues with dynamic requires
    if (isNextJsEnvironment) {
      log('info', '🔍 Detected Next.js environment, using external process for NBase');
      const success = await startExternalProcess(nbasePath, spawn, path, existsSync);
      if (success) writeStatusToFile(); // Update status on success
      return success;
    }

    // Try to start server directly in-process (preferred for non-Next.js environments)
    try {
      log('info', '🔄 Starting NBase server in-process...');

      // Set up environment
      // require('module').Module._initPaths();

      // Try different possible entry points for NBase
      let nbase;
      const possibleEntryPoints = [
        path.join(nbasePath, 'dist', 'index.js'), // Prioritize dist which is more likely to exist
        path.join(nbasePath, 'index.js')
      ];

      // Find the first entry point that exists
      const entryPoint = possibleEntryPoints.find(p => existsSync(p));

      if (!entryPoint) {
        throw new Error('Could not find NBase entry point. Please make sure NBase is built correctly.');
      }

      log('debug', `📄 Using NBase entry point: ${entryPoint}`);
      try {
        nbase = await import(entryPoint);
      } catch (requireError) {
        log('error', `❌ Error requiring NBase (${nbasePath}) module:`, requireError);
        throw requireError;
      }

      // If nbase module doesn't have startServer function, try to find it
      if (typeof nbase.startServer !== 'function') {
        if (nbase.server && typeof nbase.server.startServer === 'function') {
          nbase = nbase.server;
        } else if (nbase.default && typeof nbase.default.startServer === 'function') {
          nbase = nbase.default;
        } else {
          throw new Error('NBase module does not expose a startServer function');
        }
      }

      // Start the server with our configuration
      const serverConfig = {
        port: parseInt(process.env.NBASE_PORT || '1307', 10),
        host: process.env.NBASE_HOST || 'localhost',
        dbPath: process.env.NBASE_DB_PATH || path.join(nbasePath, 'data', 'vectors.json'),
        debug: process.env.NBASE_DEBUG === 'true'
      };

      log('debug', '⚙️ NBase server config:', serverConfig);
      const serverInstance = nbase.startServer(serverConfig);

      directServerInstance = serverInstance.server;
      serverType = 'direct'; // Set server type

      // Wait for server to be ready
      const serverUrl = `http://${process.env.NBASE_HOST || 'localhost'}:${process.env.NBASE_PORT || 1307}/health`;
      const ready = await waitForServerReady(serverUrl);
      if (ready) writeStatusToFile(); // Update status on success
      return ready;
    } catch (directError) {
      log('error', '❌ Error starting in-process server:', directError);
      log('warn', '⚠️ Falling back to external process...');

      // Fall back to external process
      const success = await startExternalProcess(nbasePath, spawn, path, existsSync);
      if (success) writeStatusToFile(); // Update status on success
      return success;
    }
  } catch (error) {
    log('error', '❌ Error starting NBase:', error instanceof Error ? error.message : String(error));
    writeStatusToFile(); // Update status even on failure (to show stopped)
    return false;
  }
}

/**
 * Start the server in an external process as fallback
 */
async function startExternalProcess(
  nbasePath: string,
  spawn: any,
  path: any,
  existsSync: any
): Promise<boolean> {
  // Find the correct script to execute

  // Check possible server script locations - prioritize the one that worked in logs
  const possibleScriptPaths = [
    path.join(nbasePath, 'dist', 'server', 'index.js'), // Prioritize this path based on logs
  ];

  // Find the first script that exists
  const scriptPath = possibleScriptPaths.find(p => existsSync(p));

  if (!scriptPath) {
    log('error', '❌ Could not find NBase server script. Checked paths:', possibleScriptPaths);
    return false;
  }

  log('info', `📄 Using NBase server script: ${scriptPath}`);

  const env = {
    ...process.env,
    PORT: process.env.NBASE_PORT || '1307',
    HOST: process.env.NBASE_HOST || 'localhost',
    DB_PATH: process.env.NBASE_DB_PATH || path.join(nbasePath, 'database'),
  };

  // Start process
  nbaseProcess = spawn('node', [scriptPath], {
    env,
    cwd: nbasePath,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (!nbaseProcess?.pid) {
    log('error', '❌ Failed to start NBase process');
    serverType = null; // Reset server type on failure
    writeStatusToFile(); // Update status on failure
    return false;
  }

  serverType = 'external'; // Set server type
  log('info', `🟢 NBase process started with PID ${nbaseProcess.pid}`);
  writeStatusToFile(); // Update status on exit


  // Handle output
  nbaseProcess.stdout?.on('data', (data: any) => {
    const output = data.toString().trim();
    log('info', `📤 [NBase] ${output}`);
  });

  nbaseProcess.stderr?.on('data', (data: any) => {
    const output = data.toString().trim();
    log('error', `📥 [NBase Error] ${output}`);
  });

  // Handle exit
  nbaseProcess.on('close', (code: any) => {
    log('info', `🛑 NBase process exited with code ${code}`);
    nbaseProcess = null;
    serverType = null;
    writeStatusToFile(); // Update status on exit
  });

  // Wait for server to be ready
  const serverUrl = `http://${env.HOST}:${env.PORT}/health`;
  return await waitForServerReady(serverUrl); // Status updated in startNbaseServer on success
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

  return new Promise(resolve => {
    // Stop the direct server instance if it's running
    if (directServerInstance) {
      log('info', '🛑 Stopping direct NBase server instance...');
      directServerInstance.close(() => {
        directServerInstance = null;
        serverType = null;
        log('info', '✅ Direct NBase server instance stopped');
        writeStatusToFile(); // Update status
        resolve();
      });
      return;
    }

    if (!nbaseProcess) {
      serverType = null; // Ensure type is null if no process
      writeStatusToFile(); // Update status (already stopped)
      resolve();
      return;
    }

    log('info', '🛑 Stopping NBase server process...');

    // Set timeout for force kill
    const killTimeout = setTimeout(() => {
      if (nbaseProcess) {
        log('warn', '⚠️ Force killing NBase process...');
        nbaseProcess.kill('SIGKILL');
        nbaseProcess = null;
        serverType = null;
        writeStatusToFile(); // Update status
        resolve();
      }
    }, 3000);

    // Handle normal exit
    nbaseProcess.on('close', () => {
      clearTimeout(killTimeout);
      nbaseProcess = null;
      serverType = null;
      log('info', '✅ NBase server stopped');
      writeStatusToFile(); // Update status
      resolve();
    });

    // Try graceful shutdown
    nbaseProcess.kill('SIGTERM');
  });
}

// Handle process exit to clean up the NBase server
if (typeof process !== 'undefined' && typeof window === 'undefined') {
  const cleanupHandler = async () => {
    log('info', '🧹 Cleaning up NBase server before exit...');
    await stopNbaseServer(); // stopNbaseServer now handles writeStatusToFile
    process.exit(0);
  };

  process.on('SIGINT', cleanupHandler);
  process.on('SIGTERM', cleanupHandler);
  process.on('exit', () => {
    if (nbaseProcess) {
      log('warn', '⚠️ NBase process still running on exit, force killing.');
      nbaseProcess.kill('SIGKILL');
      nbaseProcess = null;
      serverType = null;
      writeStatusToFile(); // Update status on forced exit
    } else if (directServerInstance) {
      log('warn', '⚠️ Direct NBase server instance still running on exit.');
      // Cannot forcefully close direct instance here easily, rely on process exit
      directServerInstance = null;
      serverType = null;
      writeStatusToFile(); // Update status on exit
    } else {
      // Ensure status reflects stopped state if exit happens before start/stop logic completes
      writeStatusToFile();
    }
  });
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

    // Test server connection with a healthcheck
    const serverUrl = `${nbaseService.NBASE_URL}/health`;
    log('info', `🔍 Testing NBase connection at ${serverUrl}...`);

    const response = await fetch(serverUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      log('warn', `⚠️ NBase health check failed: ${response.status} ${response.statusText}`);
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
