import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, name } = req.body;

    // Basic validation
    if (!email || !username || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email, username, and password are required',
      });
    }

    const result = await AuthService.register(email, username, password, name);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed';
    console.error('[Auth Register] Error:', errorMsg);
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email and password are required',
      });
    }

    const result = await AuthService.login(email, password);

    if (!result.ok) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed';
    console.error('[Auth Login] Error:', errorMsg);
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const user = await AuthService.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({ ok: true, user });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to get profile';
    console.error('[Auth Profile] Error:', errorMsg);
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

/**
 * Logout (client-side operation - just returns success)
 * POST /api/auth/logout
 */
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({ ok: true, message: 'Logged out successfully' });
});

export default router;
