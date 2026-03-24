import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import type { Request, Response } from 'express';
import { executeFlowOnServer } from './flowExecutor';

const app = express();
const port = Number(process.env.SQL_SERVER_PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'n2flow-sql-server' });
});

app.post('/api/sql/query', async (req: Request, res: Response) => {
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
      error: err instanceof Error ? err.message : 'SQL execution failed',
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

app.post('/api/flow/execute', async (req: Request, res: Response) => {
  try {
    const { nodes, edges, inputMessage, isSilent = false, apiKey } = req.body || {};
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      res.status(400).json({ error: 'Invalid payload. nodes and edges must be arrays.' });
      return;
    }

    const result = await executeFlowOnServer({
      nodes,
      edges,
      inputMessage,
      isSilent,
      apiKey,
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Flow execution failed',
    });
  }
});

app.post('/api/flow/execute/stream', async (req: Request, res: Response) => {
  const { nodes, edges, inputMessage, isSilent = false, apiKey } = req.body || {};
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    res.status(400).json({ error: 'Invalid payload. nodes and edges must be arrays.' });
    return;
  }

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
  });

  const writeEvent = (event: unknown) => {
    if (clientDisconnected) return;
    try {
      res.write(`${JSON.stringify(event)}\n`);
    } catch {
    }
  };

  const heartbeat = setInterval(() => {
    writeEvent({ type: 'ping' });
  }, 10000);

  try {
    const result = await executeFlowOnServer({
      nodes,
      edges,
      inputMessage,
      isSilent,
      apiKey,
      onEvent: writeEvent,
      shouldStop: () => clientDisconnected,
    });
    writeEvent({ type: 'done', output: result.output });
  } catch (err) {
    if (!clientDisconnected) {
      writeEvent({
        type: 'error',
        message: err instanceof Error ? err.message : 'Flow execution failed',
      });
    }
  } finally {
    clearInterval(heartbeat);
    if (!clientDisconnected) {
      res.end();
    }
  }
});

import path from 'path';
import fs from 'fs/promises';

const FLOWS_DIR = path.join(process.cwd(), 'flows');

// Ensure flows directory exists
async function ensureFlowsDir() {
  try {
    await fs.access(FLOWS_DIR);
  } catch {
    await fs.mkdir(FLOWS_DIR, { recursive: true });
  }
}
ensureFlowsDir();

app.get('/api/flows', async (_req: Request, res: Response) => {
  try {
    const files = await fs.readdir(FLOWS_DIR);
    const flows = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          const content = await fs.readFile(path.join(FLOWS_DIR, f), 'utf-8');
          const data = JSON.parse(content);
          return {
            id: data.id,
            name: data.name || f.replace('.json', ''),
            updatedAt: data.updatedAt || Date.now(),
            nodeCount: data.data?.nodes?.length || 0,
            edgeCount: data.data?.edges?.length || 0
          };
        })
    );
    res.json(flows.sort((a, b) => b.updatedAt - a.updatedAt));
  } catch (err) {
    res.status(500).json({ error: 'Failed to list flows' });
  }
});

app.get('/api/flows/:id', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(FLOWS_DIR, `${req.params.id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(404).json({ error: 'Flow not found' });
  }
});

app.post('/api/flows', async (req: Request, res: Response) => {
  try {
    const flow = req.body;
    if (!flow.id) {
      res.status(400).json({ error: 'Flow ID is required' });
      return;
    }
    const filePath = path.join(FLOWS_DIR, `${flow.id}.json`);
    flow.updatedAt = Date.now();
    await fs.writeFile(filePath, JSON.stringify(flow, null, 2), 'utf-8');
    res.json({ ok: true, id: flow.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save flow' });
  }
});

app.delete('/api/flows/:id', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(FLOWS_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

app.listen(port, () => {
  console.log(`[n2flow] SQL server is running at http://localhost:${port}`);
});
