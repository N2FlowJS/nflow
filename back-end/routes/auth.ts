import { Router, type Request, type Response, type NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { type AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('Auth');

// Not the shared `asyncHandler`: this variant answers 500 itself with a sanitized
// message instead of forwarding to the global error handler.
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void =>
  void Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
    const errorMsg = toErrorMessage(err);
    logger.error('Route error', err);
    res.status(500).json({ ok: false, error: errorMsg });
  });

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email: { type: string }
 *               username: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, name } = req.body;

    const result = await AuthService.register(email, username, password, name);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  }),
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    if (!result.ok) {
      return res.status(401).json(result);
    }

    return res.json(result);
  }),
);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const user = await AuthService.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({ ok: true, user });
  }),
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json({ ok: true, message: 'Logged out successfully' });
});

export default router;
