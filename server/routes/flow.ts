import { Router, Request, Response } from 'express';
import { executeFlowOnServer } from '../services/flowExecutionService';
import { FlowStorageService } from '../services/flowStorageService';

const router = Router();

// Execution endpoints
router.post('/flow/execute', async (req: Request, res: Response) => {
  try {
    const { nodes, edges, inputMessage, isSilent = false, apiKey, globalVariables } = req.body || {};
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      res.status(400).json({ error: 'Invalid payload. nodes and edges must be arrays.' });
      return;
    }

    const result = await executeFlowOnServer({
      nodes,
      edges,
      inputMessage,
      isSilent,
      apiKey: typeof apiKey === 'string' ? apiKey : undefined,
      globalVariables,
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Flow execution failed',
    });
  }
});

router.post('/flow/execute/stream', async (req: Request, res: Response) => {
  const { nodes, edges, inputMessage, isSilent = false, apiKey, globalVariables } = req.body || {};
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
      apiKey: typeof apiKey === 'string' ? apiKey : undefined,
      onEvent: writeEvent,
      shouldStop: () => clientDisconnected,
      globalVariables,
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

// Storage endpoints
router.get('/flows', async (_req: Request, res: Response) => {
  try {
    const flows = await FlowStorageService.listFlows();
    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list flows' });
  }
});

router.get('/flows/:id', async (req: Request, res: Response) => {
  try {
    const data = await FlowStorageService.getFlow(String(req.params.id));
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Flow not found' });
  }
});

router.post('/flows', async (req: Request, res: Response) => {
  try {
    const id = await FlowStorageService.saveFlow(req.body);
    res.json({ ok: true, id });
  } catch (err) {
    console.error('Save flow error:', err);
    res.status(500).json({ error: 'Failed to save flow' });
  }
});

router.delete('/flows/:id', async (req: Request, res: Response) => {
  try {
    await FlowStorageService.deleteFlow(String(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

export default router;
