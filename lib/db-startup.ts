import { prisma, testConnection } from './prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Server-side state
let connectionState: 'connected' | 'error' | 'pending' = 'pending'
let connectionError: Error | null = null;
let lastChecked: number = 0;
let setupAttempted: boolean = false;

// Configurable timeout for database operations
const DB_OPERATION_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 3;

// Attempt to run migrations if needed
async function attemptDatabaseSetup() {
  if (setupAttempted) return; // Only try once per server instance
  
  try {
    console.log('[db-startup] Checking if database needs setup...');
    
    // Check if migrations directory exists
    const migrationsDir = path.join(process.cwd(), 'prisma/migrations');
    const dbFile = path.resolve(process.cwd(), 'prisma/dev.db');
    const needsSetup = !fs.existsSync(dbFile) || 
                      fs.statSync(dbFile).size < 1000;
    
    if (needsSetup) {
      console.log('[db-startup] Database needs initialization, running migrations...');
      
      // Generate client if needed
      if (!fs.existsSync(path.join(process.cwd(), 'node_modules/.prisma'))) {
        console.log('[db-startup] Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit' });
      }
      
      // Check if migrations exist
      const hasMigrations = fs.existsSync(migrationsDir) && 
        fs.readdirSync(migrationsDir).length > 0;
      
      if (hasMigrations) {
        console.log('[db-startup] Applying existing migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } else {
        console.log('[db-startup] Creating initial migration...');
        try {
          execSync('npx prisma migrate dev --name init --create-only', 
            { stdio: 'inherit', timeout: 30000 });
          execSync('npx prisma migrate deploy', 
            { stdio: 'inherit', timeout: 30000 });
        } catch (e) {
          console.log('[db-startup] Migration creation had issues, trying direct push...');
          execSync('npx prisma db push', { stdio: 'inherit' });
        }
      }
      
      console.log('[db-startup] Database setup completed.');
    } else {
      console.log('[db-startup] Database file exists, checking connection...');
    }
    
    setupAttempted = true;
  } catch (error) {
    console.error('Failed to set up database:', error);
    connectionError = error instanceof Error ? error : new Error(String(error));
  }
}

// Helper function to execute database operations with timeout and retries
async function executeWithRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a promise race between the operation and a timeout
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Operation timed out after ${DB_OPERATION_TIMEOUT}ms`)), 
                   DB_OPERATION_TIMEOUT);
        })
      ]);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 500; // Exponential backoff
        console.log(`Database operation failed, retrying in ${delay}ms... (${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Helper function to check if a table exists in SQLite
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await executeWithRetry(() => 
      prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name=lower(${tableName})`
    );
    return Array.isArray(result) && result.length > 0;
  } catch (e) {
    console.error(`Error checking if table ${tableName} exists:`, e);
    return false;
  }
}

// Initialize database connection (server-side only)
export async function initDatabase() {
  console.log('[db-startup] Initializing database connection...')
  
  try {
    // First try to connect
    const connected = await testConnection()
    
    // If connection failed, try setting up the database
    if (!connected && !setupAttempted) {
      await attemptDatabaseSetup();
      // Try connecting again after setup
      await testConnection();
    }
    
    // Proceed with verification
    if (await testConnection()) {
      try {
        // Just test a basic query that doesn't require specific tables
        await executeWithRetry(() => prisma.$queryRaw`SELECT 1+1 as result`);
        console.log('[db-startup] Database connection verified with basic query.')
        connectionState = 'connected'
        lastChecked = Date.now()
        
        // Check if the tables exist before trying to query them
        const teamTableExists = await tableExists('team');
        
        if (teamTableExists) {
          try {
            // Use the executeWithRetry helper for the team count operation
            const teamCount = await executeWithRetry(() => prisma.team.count());
            console.log(`[db-startup] Database schema verified. Found ${teamCount} teams.`)
          } catch (countError) {
            console.warn('Error counting teams:', countError);
            // Still consider connected since basic query worked
          }
        } else {
          console.log('[db-startup] Team table does not exist yet. Database may need schema applied.');
          
          // Try to automatically apply the schema if tables don't exist
          if (!setupAttempted) {
            await attemptDatabaseSetup();
            // Check if setup helped
            if (await tableExists('team')) {
              const teamCount = await executeWithRetry(() => prisma.team.count());
              console.log(`[db-startup] Database schema now verified. Found ${teamCount} teams.`);
            } else {
              console.log('[db-startup] Tables still do not exist after setup attempt. Manual schema push may be required.');
            }
          }
        }
        
        // Consider connected even if tables don't exist yet, as long as the basic query works
        return true;
      } catch (e) {
        console.error('Database query failed:', e)
        connectionError = e instanceof Error ? e : new Error(String(e))
        connectionState = 'error'
        lastChecked = Date.now()
        return false
      }
    } else {
      connectionState = 'error'
      lastChecked = Date.now()
      return false
    }
  } catch (e) {
    console.error('Database initialization failed:', e)
    connectionError = e instanceof Error ? e : new Error(String(e))
    connectionState = 'error'
    lastChecked = Date.now()
    return false
  }
}

// Get connection state for API use
export function getConnectionState() {
  return {
    state: connectionState,
    error: connectionError ? connectionError.message : null,
    lastChecked,
    setupAttempted
  }
}

// Execute init at server startup
initDatabase().catch(console.error)
