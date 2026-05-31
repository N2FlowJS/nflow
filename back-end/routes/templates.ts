import { Router, Response } from 'express';
import { FLOW_TEMPLATES } from '../flow-templates';
import { successResponse, errorResponse } from '../utils/apiResponse';

const router = Router();

router.get('/templates', (_req, res: Response) => {
  try {
    res.json(successResponse(FLOW_TEMPLATES));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to fetch templates'));
  }
});

export default router;
