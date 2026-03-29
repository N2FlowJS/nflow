import sql from 'mssql';
import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../../utils/common';

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
  const queryTemplate = String(getNodeFieldValue(node, 'query') || args.query || '');
  if (!queryTemplate) return 'Error: SQL query is empty.';

  // Parameterize the query: replace {var} with @var for safe binding
  const params: Record<string, any> = {};
  const safeQuery = queryTemplate.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_m, key) => {
    const value = args[key];
    if (value !== undefined) {
      params[key] = value;
      return `@${key}`;
    }
    return `{${key}}`; // Leave as is if not found (legacy behavior)
  });

  const body = {
    server: getNodeFieldValue(node, 'server') || getNodeFieldValue(node, 'host') || '',
    port: Number(getNodeFieldValue(node, 'port') || 1433),
    user: getNodeFieldValue(node, 'user') || '',
    password: getNodeFieldValue(node, 'password') || '',
    database: getNodeFieldValue(node, 'database') || '',
    encrypt: String(getNodeFieldValue(node, 'encrypt') ?? 'false') === 'true',
    trustServerCertificate: String(getNodeFieldValue(node, 'trustServerCertificate') ?? 'true') === 'true',
    timeoutMs: Number(getNodeFieldValue(node, 'timeoutMs') || 30000),
    maxRows: Number(getNodeFieldValue(node, 'maxRows') || 200),
  };

  if (!body.server || !body.user || !body.database) {
    return 'Error: Missing DB config (server/user/database).';
  }

  try {
    const payload = await runMssqlQuery({
      server: String(body.server),
      port: Number(body.port),
      user: String(body.user),
      password: String(body.password),
      database: String(body.database),
      encrypt: Boolean(body.encrypt),
      trustServerCertificate: Boolean(body.trustServerCertificate),
      timeoutMs: Number(body.timeoutMs),
      maxRows: Number(body.maxRows),
      query: safeQuery,
      params,
    });
    return JSON.stringify({
      rowCount: payload?.rowCount || 0,
      totalRowCount: payload?.totalRowCount || payload?.rowCount || 0,
      maxRows: payload?.maxRows || body.maxRows,
      durationMs: payload?.durationMs,
      rows: Array.isArray(payload?.rows) ? payload.rows : [],
    });
  } catch (err) {
    return `Error executing MSSQL query: ${String(err)}`;
  }
};
