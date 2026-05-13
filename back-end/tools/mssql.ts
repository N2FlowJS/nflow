import sql from 'mssql';
import { ToolHandler } from './registry';
import { extractNodeConfig } from './utils';

const runMssqlQuery = async (config: {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  timeoutMs: number;
  maxRows: number;
  query: string;
  params: Record<string, any>;
}) => {
  let pool: sql.ConnectionPool | null = null;
  const startedAt = Date.now();
  try {
    pool = await sql.connect({
      server: config.server,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionTimeout: config.timeoutMs,
      requestTimeout: config.timeoutMs,
      options: {
        encrypt: config.encrypt,
        trustServerCertificate: config.trustServerCertificate,
      },
    });

    const request = pool.request();
    // Safely bind parameters
    for (const [key, val] of Object.entries(config.params)) {
      request.input(key, val);
    }

    const result = await request.query(config.query);
    const normalizedMaxRows = Math.max(1, Math.min(2000, Number(config.maxRows) || 200));
    const rows = Array.isArray(result.recordset)
      ? result.recordset.slice(0, normalizedMaxRows)
      : [];

    return {
      rowCount: rows.length,
      totalRowCount: Array.isArray(result.recordset) ? result.recordset.length : 0,
      maxRows: normalizedMaxRows,
      durationMs: Date.now() - startedAt,
      rows,
    };
  } finally {
    if (pool) {
      try { await pool.close(); } catch {}
    }
  }
};

export const mssqlHandler: ToolHandler = async (node, args) => {
  const configValues = extractNodeConfig(node, [
    'query',
    'server',
    'host',
    'port',
    'user',
    'password',
    'database',
    'encrypt',
    'trustServerCertificate',
    'timeoutMs',
    'maxRows'
  ]);

  const queryTemplate = String(configValues.query || args.query || '');
  if (!queryTemplate) return 'Error: SQL query is empty.';

  // Extract parameter names from template
  const paramNames = new Set<string>();
  queryTemplate.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_m, key) => {
    paramNames.add(key);
    return '';
  });

  // Validate that all required parameters are provided
  const missingParams: string[] = [];
  for (const paramName of paramNames) {
    if (args[paramName] === undefined) {
      missingParams.push(paramName);
    }
  }

  if (missingParams.length > 0 && paramNames.size > 0) {
    return `Error: Missing SQL parameters: ${missingParams.join(', ')}. Query template expects: ${Array.from(paramNames).join(', ')}`;
  }

  // Parameterize the query: replace {var} with @var for safe binding
  const params: Record<string, any> = {};
  const safeQuery = queryTemplate.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_m, key) => {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {  // Validate parameter name format
      const value = args[key];
      if (value !== undefined) {
        params[key] = value;
        return `@${key}`;
      }
      return `{${key}}`; // If not provided, keep original (will be caught above)
    } else {
      return _m; // Return as-is if format is invalid (suspicious)
    }
  });

  const cfg = {
    server: String(configValues.server || configValues.host || ''),
    port: Number(configValues.port || 1433),
    user: String(configValues.user || ''),
    password: String(configValues.password || ''),
    database: String(configValues.database || ''),
    encrypt: String(configValues.encrypt ?? 'false') === 'true',
    trustServerCertificate: String(configValues.trustServerCertificate ?? 'true') === 'true',
    timeoutMs: Number(configValues.timeoutMs) || 30000,
    maxRows: Number(configValues.maxRows) || 200,
  };

  if (!cfg.server || !cfg.user || !cfg.database) {
    return 'Error: Missing DB config (server/user/database).';
  }

  try {
    const payload = await runMssqlQuery({ ...cfg, query: safeQuery, params });
    return JSON.stringify({
      rowCount: payload?.rowCount || 0,
      totalRowCount: payload?.totalRowCount || payload?.rowCount || 0,
      maxRows: payload?.maxRows || cfg.maxRows,
      durationMs: payload?.durationMs,
      rows: Array.isArray(payload?.rows) ? payload.rows : [],
    });
  } catch (err) {
    return `Error executing MSSQL query: ${String(err)}`;
  }
};
