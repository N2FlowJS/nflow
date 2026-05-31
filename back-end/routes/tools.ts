import { Router, Request, Response } from 'express';
import { ToolRegistry } from '../tools';
import { createLogger } from '../utils/logger';
import { toErrorMessage } from '../utils/common';

const logger = createLogger('Tools');

const router = Router();

/**
 * @openapi
 * /api/tools:
 *   get:
 *     summary: List all available system tools
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: List of tools retrieved
 */
router.get('/tools', (req: Request, res: Response) => {
  try {
    const types = ToolRegistry.listRegisteredTypes();
    const tools = types.map((name) => {
      const reg = ToolRegistry.getRegistration(name);
      return {
        id: name,
        name: name,
        category: reg?.metadata?.category || 'Other',
      };
    });
    res.json({ tools });
  } catch (err) {
    logger.error('Failed to list tools', { error: toErrorMessage(err) });
    res.status(500).json({ error: 'Failed to list tools' });
  }
});

/**
 * @openapi
 * /api/tools/{toolId}:
 *   get:
 *     summary: Get details for a specific tool
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tool details retrieved
 *       404:
 *         description: Tool not found
 */
router.get('/tools/:toolId', (req: Request, res: Response) => {
  try {
    const toolId = String(req.params.toolId);
    const reg = ToolRegistry.getRegistration(toolId);

    if (!reg) {
      res.status(404).json({ error: `Tool ${toolId} not found` });
      return;
    }

    res.json({
      id: toolId,
      name: toolId,
      category: reg.metadata?.category || 'Other',
      description: reg.metadata?.description || 'Integration tool',
      requiredParams: reg.metadata?.requiredParams || [],
    });
  } catch (err) {
    logger.error('Failed to get tool details', { error: toErrorMessage(err) });
    res.status(500).json({ error: 'Failed to get tool details' });
  }
});

export default router;
