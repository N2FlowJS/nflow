import { Router, Request, Response } from 'express';
import sql from 'mssql';
import { toErrorMessage } from '../utils/common';

const router = Router();

router.post('/sql/query', async (req: Request, res: Response) => {
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
    res.status(400).json({
      error: 'Missing required fields: server, user, database, query',
    });
    return;
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
      rows,
      rowCount: rows.length,
      totalRowCount: Array.isArray(result.recordset) ? result.recordset.length : 0,
      maxRows: normalizedMaxRows,
      recordsets: result.recordsets || [],
      durationMs,
      columns: result.recordset?.columns ? Object.keys(result.recordset.columns) : undefined,
    });
  } catch (err) {
    res.status(500).json({
      error: toErrorMessage(err, 'SQL execution failed'),
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch {
      }
    }
  }
});

export default router;
