import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('Auth');

const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => 
  Promise.resolve(fn(req, res, next)).catch(err => {
    const errorMsg = toErrorMessage(err);
    logger.error('Route error', err);
    res.status(500).json({ ok: false, error: errorMsg });
  });

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, name } = req.body;

  const result = await AuthService.register(email, username, password, name);

  if (!result.ok) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  if (!result.ok) {
    return res.status(401).json(result);
  }

  res.json(result);
}));

/**
 * Get current user profile
 * GET /api/auth/profile
 */
router.get('/profile', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  const user = await AuthService.getUserById(req.userId);

  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  res.json({ ok: true, user });
}));

/**
 * Logout (client-side operation - just returns success)
 */
router.post('/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ ok: true, message: 'Logged out successfully' });
});

export default router;
