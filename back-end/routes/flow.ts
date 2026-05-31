import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { executeFlowOnServer } from '../services/flowExecutionService';
import { FlowStorageService } from '../services/flowStorageService';
import { RequestValidator, TypeConverters } from '../middleware/validation';
import { LogSanitizer } from '../middleware/logSanitizer';
import { AuthRequest } from '../middleware/auth';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/apiResponse';

const router = Router();
const logger = createLogger('Flow');

/**
 * @openapi
 * /api/flow/execute:
 *   post:
 *     summary: Execute a flow synchronously
 *     tags: [Flows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nodes, edges]
 *             properties:
 *               nodes: { type: array, items: { type: object } }
 *               edges: { type: array, items: { type: object } }
 *               inputMessage: { type: string }
 *               isSilent: { type: boolean }
 *               globalVariables: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Flow executed successfully
 *       500:
 *         description: Execution failed
 */
router.post('/flow/execute', async (req: AuthRequest, res: Response) => {
  try {
    // Validate request payload
    const validatedRequest = RequestValidator.validateFlowExecution(req.body);

    const result = await executeFlowOnServer({
      nodes: TypeConverters.toFlowNodes(validatedRequest.nodes),
      edges: TypeConverters.toFlowEdges(validatedRequest.edges),
      flowId: validatedRequest.flowId,
      inputMessage: validatedRequest.inputMessage,
      chatHistory: validatedRequest.chatHistory,
      isSilent: validatedRequest.isSilent || false,
      apiKey: validatedRequest.apiKey,
      globalVariables: TypeConverters.toGlobalVariables(validatedRequest.globalVariables || []),
    });

    // Log execution with user context
    if (req.userId) {
      logger.info('Flow executed', { userId: req.userId });
    }

    res.json(successResponse(result));
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Flow execution failed');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Execute error', err, { userId: req.userId });
    res.status(500).json(errorResponse(sanitized));
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
        flowId: validatedRequest.flowId,
        inputMessage: validatedRequest.inputMessage,
        chatHistory: validatedRequest.chatHistory,
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


/**
 * @openapi
 * /api/flows:
 *   get:
 *     summary: List saved flows for the authenticated user
 *     tags: [Flows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: List of flows retrieved
 */
router.get('/flows', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    // Parse pagination parameters
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 100);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    
    const { flows, total } = await FlowStorageService.listFlowsScoped(userId, { limit, offset });
    
    res.json(successResponse(flows, {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    }));
  } catch (err) {
    logger.error('List flows error', err);
    res.status(500).json(errorResponse('Failed to list flows'));
  }
});

/**
 * @openapi
 * /api/flows/{id}:
 *   get:
 *     summary: Get a specific flow by ID
 *     tags: [Flows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Flow retrieved
 *       404:
 *         description: Flow not found
 */
router.get('/flows/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    const data = await FlowStorageService.getFlow(String(req.params.id), userId);
    res.json(successResponse(data));
  } catch (err) {
    res.status(404).json(errorResponse('Flow not found'));
  }
});

/**
 * @openapi
 * /api/flows:
 *   post:
 *     summary: Save or update a flow
 *     tags: [Flows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, data]
 *             properties:
 *               id: { type: string }
 *               name: { type: string }
 *               data: { type: string }
 *     responses:
 *       200:
 *         description: Flow saved successfully
 */
router.post('/flows', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    // Validate request payload
    const validatedRequest = RequestValidator.validateFlowSave(req.body);

    const id = await FlowStorageService.saveFlow({
      ...validatedRequest,
      userId, // Add user context
    });
    res.json(successResponse({ id }));
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to save flow');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Save flow error', err, { userId: req.userId });
    res.status(400).json(errorResponse(sanitized));
  }
});

router.delete('/flows/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    await FlowStorageService.deleteFlow(String(req.params.id), userId);
    res.json(successResponse({ ok: true }));
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to delete flow');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Delete flow error', err, { userId: req.userId });
    res.status(500).json(errorResponse(sanitized));
  }
});


// Version history endpoints
router.get('/flows/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    const versions = await FlowStorageService.getFlowVersions(String(req.params.id), userId);
    res.json(successResponse(versions || []));
  } catch (err) {
    res.status(404).json(errorResponse('Flow not found'));
  }
});

router.get('/flows/:id/versions/:versionId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    const flow = await FlowStorageService.getFlowVersion(
      String(req.params.id),
      String(req.params.versionId),
      userId,
    );
    if (!flow) {
      res.status(404).json(errorResponse('Version not found'));
      return;
    }
    res.json(successResponse(flow));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to retrieve version'));
  }
});

router.post('/flows/:id/versions/:versionId/restore', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    const flow = await FlowStorageService.restoreFlowVersion(
      String(req.params.id),
      String(req.params.versionId),
      userId
    );
    res.json(successResponse({ flow }));
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to restore version');
    const sanitized = LogSanitizer.sanitize(errorMsg);
    logger.error('Restore version error', err, { userId: req.userId });
    res.status(400).json(errorResponse(sanitized));
  }
});


/**
 * @openapi
 * /api/flows/{id}/executions:
 *   get:
 *     summary: Get execution history for a specific flow
 *     tags: [Flows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Execution history retrieved
 *       404:
 *         description: Flow not found
 */
router.get('/flows/:id/executions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json(errorResponse('Unauthorized'));

    const executions = await prisma.flowExecution.findMany({
      where: {
        flowId: String(req.params.id),
        flow: { userId } // Ensure ownership
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    res.json(successResponse(executions));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to retrieve execution history'));
  }
});

export default router;
