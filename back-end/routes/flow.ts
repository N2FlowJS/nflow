import { Router, Request, Response } from 'express';
import { executeFlowOnServer } from '../services/flowExecutionService';
import { FlowStorageService } from '../services/flowStorageService';
import { RequestValidator, TypeConverters } from '../middleware/validation';
import { LogSanitizer } from '../middleware/logSanitizer';
import { AuthRequest } from '../middleware/auth';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('Flow');

function requireFlowUser(req: AuthRequest, res: Response): string | null {
  if (!req.userId) {
    res.status(401).json({
      ok: false,
      error: 'Authentication required.',
    });
    return null;
  }

  return req.userId;
}

// Execution endpoints
router.post('/flow/execute', async (req: AuthRequest, res: Response) => {
  try {
    // Validate request payload
    const validatedRequest = RequestValidator.validateFlowExecution(req.body);

    const result = await executeFlowOnServer({
      nodes: TypeConverters.toFlowNodes(validatedRequest.nodes),
      edges: TypeConverters.toFlowEdges(validatedRequest.edges),
      inputMessage: validatedRequest.inputMessage,
      isSilent: validatedRequest.isSilent || false,
      apiKey: validatedRequest.apiKey,
      globalVariables: TypeConverters.toGlobalVariables(validatedRequest.globalVariables || []),
    });

    // Log execution with user context
    if (req.userId) {
      logger.info('Flow executed', { userId: req.userId });
    }

    res.json({ ok: true, ...result });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Flow execution failed');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Execute error', err, { userId: req.userId });
    res.status(500).json({
      ok: false,
      error: sanitized,
    });
  }
});

router.post('/flow/execute/stream', async (req: AuthRequest, res: Response) => {
  try {
    // Validate request payload
    const validatedRequest = RequestValidator.validateFlowExecution(req.body);

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let clientDisconnected = false;
    res.on('close', () => {
      clientDisconnected = true;
    });

    const writeEvent = (event: unknown) => {
      if (clientDisconnected) return;
      try {
        res.write(`${JSON.stringify(event)}\n`);
      } catch {
        // Client disconnected
      }
    };

    const heartbeat = setInterval(() => {
      writeEvent({ type: 'ping' });
    }, 10000);

    try {
      const result = await executeFlowOnServer({
        nodes: TypeConverters.toFlowNodes(validatedRequest.nodes),
        edges: TypeConverters.toFlowEdges(validatedRequest.edges),
        inputMessage: validatedRequest.inputMessage,
        isSilent: validatedRequest.isSilent || false,
        apiKey: validatedRequest.apiKey,
        onEvent: writeEvent,
        shouldStop: () => clientDisconnected,
        globalVariables: TypeConverters.toGlobalVariables(validatedRequest.globalVariables || []),
      });
      
      if (req.userId) {
        logger.info('Flow executed (streaming)', { userId: req.userId });
      }
      writeEvent({ type: 'done', output: result.output });
    } catch (err) {
      if (!clientDisconnected) {
        const errorMsg = toErrorMessage(err, 'Flow execution failed');
        writeEvent({
          type: 'error',
          message: LogSanitizer.sanitizeError(errorMsg),
        });
      }
    } finally {
      clearInterval(heartbeat);
      if (!clientDisconnected) {
        res.end();
      }
    }
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Invalid request');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Execute stream error', err);
    res.status(400).json({ error: sanitized });
  }
});


// Storage endpoints
router.get('/flows', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    // Parse pagination parameters
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 100);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    
    const allFlows = await FlowStorageService.listFlowsScoped(userId);
    const total = allFlows.length;
    const flows = allFlows.slice(offset, offset + limit);
    
    res.json({
      flows,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    const errorMsg = toErrorMessage(err);
    logger.error('List flows error', err);
    res.status(500).json({ error: 'Failed to list flows' });
  }
});

router.get('/flows/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    const data = await FlowStorageService.getFlow(String(req.params.id), userId);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Flow not found' });
  }
});

router.post('/flows', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    // Validate request payload
    const validatedRequest = RequestValidator.validateFlowSave(req.body);

    const id = await FlowStorageService.saveFlow({
      ...validatedRequest,
      userId, // Add user context
    });
    res.json({ ok: true, id });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to save flow');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Save flow error', err, { userId: req.userId });
    res.status(400).json({ error: sanitized });
  }
});

router.delete('/flows/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    await FlowStorageService.deleteFlow(String(req.params.id), userId);
    res.json({ ok: true });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to delete flow');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Delete flow error', err, { userId: req.userId });
    res.status(500).json({ error: sanitized });
  }
});

// Version history endpoints
router.get('/flows/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    const versions = await FlowStorageService.getFlowVersions(String(req.params.id), userId);
    res.json(versions || []);
  } catch (err) {
    res.status(404).json({ error: 'Flow not found' });
  }
});

router.get('/flows/:id/versions/:versionId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    const flow = await FlowStorageService.getFlowVersion(
      String(req.params.id),
      String(req.params.versionId),
      userId,
    );
    if (!flow) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }
    res.json(flow);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve version' });
  }
});

router.post('/flows/:id/versions/:versionId/restore', async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireFlowUser(req, res);
    if (!userId) return;

    const flow = await FlowStorageService.restoreFlowVersion(
      String(req.params.id),
      String(req.params.versionId),
      userId
    );
    res.json({ ok: true, flow });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to restore version');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Restore version error', err, { userId: req.userId });
    res.status(400).json({ error: sanitized });
  }
});

export default router;
