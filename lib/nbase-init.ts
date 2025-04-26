// Import necessary modules
import { log } from '../utils/logger';
import ServerNbase from '@nbase/dist/server'
// Type definitions
type ChildProcess = any;

// Server state tracking
let nbaseProcess: ChildProcess | null = null;
let directServerInstance: any = null;

/**
 * Initialize and start the NBase server process - simplified version
 */
export async function startNbaseServer(): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.warn('NBase server can only be started in a server environment');
    return false;
  }

  // Early returns for common cases
  if (nbaseProcess?.pid || directServerInstance) {
    log('info', '🟢 NBase server already running');
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
    const nbasePath = path.join(process.cwd(), 'nbase');
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
      return startExternalProcess(nbasePath, spawn, path, existsSync);
    }

    // Try to start server directly in-process (preferred for non-Next.js environments)
    try {
      log('info', '🔄 Starting NBase server in-process...');

      // Set up environment
      process.env.NODE_PATH = `${nbasePath}:${path.join(nbasePath, 'src')}:${process.env.NODE_PATH || ''}`;
      require('module').Module._initPaths();

      // Try different possible entry points for NBase
      let nbase;
      const possibleEntryPoints = [
        path.join(nbasePath, 'dist', 'index.js'), // Prioritize dist which is more likely to exist
        path.join(nbasePath, 'index.js'),
        path.join(nbasePath, 'src', 'index.js'),
        path.join(nbasePath, 'lib', 'index.js')
      ];

      // Find the first entry point that exists
      const entryPoint = possibleEntryPoints.find(p => existsSync(p));

      if (!entryPoint) {
        throw new Error('Could not find NBase entry point. Please make sure NBase is built correctly.');
      }

      log('debug', `📄 Using NBase entry point: ${entryPoint}`);
      try {
        nbase = require(entryPoint);
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

      // Wait for server to be ready
      const serverUrl = `http://${process.env.NBASE_HOST || 'localhost'}:${process.env.NBASE_PORT || 1307}/health`;
      return await waitForServerReady(serverUrl);
    } catch (directError) {
      log('error', '❌ Error starting in-process server:', directError);
      log('warn', '⚠️ Falling back to external process...');

      // Fall back to external process
      return startExternalProcess(nbasePath, spawn, path, existsSync);
    }
  } catch (error) {
    log('error', '❌ Error starting NBase:', error instanceof Error ? error.message : String(error));
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
    path.join(nbasePath, 'server', 'index.js'),
    path.join(nbasePath, 'src', 'server', 'index.js'),
    path.join(nbasePath, 'dist', 'server.js'),
    path.join(nbasePath, 'src', 'server.js'),
    path.join(nbasePath, 'server.js'),
    path.join(nbasePath, 'index.js')
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
    NODE_PATH: `${nbasePath}:${path.join(nbasePath, 'src')}:${process.env.NODE_PATH || ''}`,
    // Add database path to environment
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
    return false;
  }

  log('info', `🟢 NBase process started with PID ${nbaseProcess.pid}`);

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
  });

  // Wait for server to be ready
  const serverUrl = `http://${env.HOST}:${env.PORT}/health`;
  return await waitForServerReady(serverUrl);
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
    } catch (error) {
      // Continue trying
      log('debug', `🔄 NBase not ready yet, retrying in ${RETRY_DELAY}ms...`, error);
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
        log('info', '✅ Direct NBase server instance stopped');
        resolve();
      });
      return;
    }

    if (!nbaseProcess) {
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
        resolve();
      }
    }, 3000);

    // Handle normal exit
    nbaseProcess.on('close', () => {
      clearTimeout(killTimeout);
      nbaseProcess = null;
      log('info', '✅ NBase server stopped');
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
    await stopNbaseServer();
    process.exit(0);
  };

  process.on('SIGINT', cleanupHandler);
  process.on('SIGTERM', cleanupHandler);
  process.on('exit', () => {
    if (nbaseProcess) {
      nbaseProcess.kill('SIGKILL');
    }
  });
}
