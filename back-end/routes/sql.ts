import { Router, Request, Response } from 'express';
import sql from 'mssql';
import { toErrorMessage } from '../utils/common';

const router = Router();

const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => 
  Promise.resolve(fn(req, res, next)).catch(err => {
    const errorMsg = toErrorMessage(err);
    res.status(500).json({ ok: false, error: errorMsg });
  });

/**
 * @openapi
 * /api/sql/query:
 *   post:
 *     summary: Execute a SQL query on a MSSQL database
 *     tags: [SQL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [server, user, database, query]
 *             properties:
 *               server: { type: string }
 *               port: { type: number, default: 1433 }
 *               user: { type: string }
 *               password: { type: string }
 *               database: { type: string }
 *               query: { type: string }
 *               maxRows: { type: number, default: 200 }
 *               timeoutMs: { type: number, default: 30000 }
 *     responses:
 *       200:
 *         description: Query executed successfully
 *       400:
 *         description: Missing required connection parameters
 *       500:
 *         description: Query execution failed
 */
router.post('/sql/query', asyncHandler(async (req: Request, res: Response) => {
  const {
    server,
    port: dbPort,
    user,
    password,
    database,
    encrypt = false,
    trustServerCertificate = true,
    timeoutMs = 30000,
    maxRows = 200,
    query,
  } = req.body || {};

  if (!server || !user || !database || !query) {
    return res.status(400).json({
      ok: false,
      error: 'Missing required fields: server, user, database, query',
    });
  }

  const config = {
    server,
    port: Number(dbPort || 1433),
    user,
    password: String(password || ''),
    database,
    connectionTimeout: Number(timeoutMs),
    requestTimeout: Number(timeoutMs),
    options: {
      encrypt: !!encrypt,
      trustServerCertificate: !!trustServerCertificate,
    },
  };

  let pool;
  const startedAt = Date.now();

  try {
    pool = await sql.connect(config);
    const result = await pool.request().query(String(query));
    const durationMs = Date.now() - startedAt;
    const normalizedMaxRows = Math.max(1, Math.min(2000, Number(maxRows) || 200));
    const rows = Array.isArray(result.recordset)
      ? result.recordset.slice(0, normalizedMaxRows)
      : [];

    res.json({
      ok: true,
      rows,
      rowCount: rows.length,
      totalRowCount: Array.isArray(result.recordset) ? result.recordset.length : 0,
      maxRows: normalizedMaxRows,
      recordsets: result.recordsets || [],
      durationMs,
      columns: result.recordset?.columns ? Object.keys(result.recordset.columns) : undefined,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch {
      }
    }
  }
}));

export default router;
