import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow/type';
import { BaseNodeExecutor } from '../../../packages/@node-plugin/base-executor';

// Registry of executor instances by node type
const EXECUTOR_REGISTRY: Map<string, BaseNodeExecutor<any>> = new Map();

// In dev/test, allow requiring TypeScript files directly (without per-package build)
let _tsNodeRegistered = false;
function ensureTsSupport() {
  if (_tsNodeRegistered) return;
  try {
    const tsNode = require('ts-node');
    tsNode.register({
      transpileOnly: true,
      compilerOptions: {
        jsx: 'react-jsx',
        module: 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
      },
    });
    // Respect tsconfig "paths" so imports like @n2flowjs/template/* work in Node
    try {
      require('tsconfig-paths/register');
    } catch {
      /* optional: tsconfig-paths may not be present */
    }
    _tsNodeRegistered = true;
    if (process.env.NODE_ENV !== 'production') console.log('[nflow] ts-node register enabled for executor loading');
  } catch {
    // ts-node may not be installed in some environments; ignore and try .js files
  }
}

// Helper: type guard to identify a BaseNodeExecutor
function isBaseNodeExecutor(obj: any): obj is BaseNodeExecutor<any> {
  return !!obj && typeof obj.execute === 'function' && obj.config?.nodeType;
}

// Attempt to load executor from package
function tryLoadExecutorForPackage(pkgName: string): BaseNodeExecutor<any> | null {
  // Resolve from repo root to avoid fragile relative paths
  const _req = (eval('require') as NodeJS.Require);
  const _path = _req('path') as typeof import('path');
  const _fs = _req('fs') as typeof import('fs');
  const abs = _path.join(process.cwd(), 'packages', pkgName);

  // In dev, register ts-node so we can require .ts files
  if (process.env.NODE_ENV !== 'production') ensureTsSupport();

  const tryPaths: string[] = [];
  // Try executor.ts first (new pattern)
  tryPaths.push(_path.join(abs, 'executor.ts'));
  tryPaths.push(_path.join(abs, 'executor.js'));


  let lastErr: any = null;
  for (const p of tryPaths) {
    try {
      if (_fs.existsSync(p)) {
        const mod = _req(p);
        const executor = pickExecutorFromModule(mod);
        if (executor) return executor;
      }
    } catch (err) {
      lastErr = err;
      // keep trying other paths
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (lastErr) console.warn(`[nflow] Failed to load executor for package '${pkgName}':`, lastErr);
    else console.warn(`[nflow] No executor found for package directory '${abs}'.`);
  }
  return null;
}

function pickExecutorFromModule(mod: any): BaseNodeExecutor<any> | null {
  if (!mod) return null;

  // Look for executor exports
  const candidates: any[] = [];
  if (mod.default && isBaseNodeExecutor(mod.default)) candidates.push(mod.default);
  if (mod.executor && isBaseNodeExecutor(mod.executor)) candidates.push(mod.executor);

  // Look for any export that is a BaseNodeExecutor
  for (const k of Object.keys(mod)) {
    const val = mod[k];
    if (isBaseNodeExecutor(val)) candidates.push(val);
  }

  return candidates[0] || null;
}

// Auto-discover and register executors
function autoRegisterExecutors() {
  const packagesDir = require('path').join(process.cwd(), 'packages');
  const fs = require('fs');

  if (!fs.existsSync(packagesDir)) {
    console.warn('[nflow] Packages directory not found');
    return;
  }

  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  const packageDirs = entries
    .filter((entry: any) => entry.isDirectory() && !entry.name.startsWith('@'))
    .map((entry: any) => entry.name);

  for (const pkgName of packageDirs) {
    try {
      const executor = tryLoadExecutorForPackage(pkgName);
      if (executor) {
        EXECUTOR_REGISTRY.set(executor.config.nodeType, executor);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[nflow] Registered executor: ${executor.config.nodeType} (${pkgName})`);
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[nflow] Failed to register executor for ${pkgName}:`, err);
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[nflow] Total executors registered: ${EXECUTOR_REGISTRY.size}`);
  }
}

// Register a custom executor (for dynamically created custom nodes)
export function registerExecutor(nodeType: string, executor: BaseNodeExecutor<any>) {
  EXECUTOR_REGISTRY.set(nodeType, executor);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[nflow] Registered custom executor: ${nodeType}`);
  }
}

// Initialize executor registry
autoRegisterExecutors();

export async function executeNode(
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const executor = EXECUTOR_REGISTRY.get(node.type);

  if (!executor) {
    throw new Error(`No executor found for node type: ${node.type}. Available types: ${Array.from(EXECUTOR_REGISTRY.keys()).join(', ')}`);
  }

  try {
    return await executor.execute(node, context, callback, dispatcher);
  } catch (error) {
    console.error(`[nflow] Executor error for ${node.type}:`, error);
    throw error;
  }
}
