import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import rootRouter from './routes';
import { authMiddleware } from './middleware/auth';
import { LogSanitizer, installGlobalLogSanitizer } from './middleware/logSanitizer';

const app = express();
const port = Number(process.env.SQL_SERVER_PORT || 8787);
const isProduction = process.env.NODE_ENV === 'production';

function readNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function createJsonRateLimitMessage(windowMs: number, message: string) {
  return {
    ok: false,
    error: message,
    retryAfterMs: windowMs,
  };
}

// Enable global log sanitization if requested
if (process.env.ENABLE_LOG_SANITIZATION === 'true') {
  installGlobalLogSanitizer();
}

// Security: keep request throttling configurable. Local development is noisy
// because the editor polls and retries often, so only enable the global limiter
// outside dev unless explicitly requested.
const globalRateLimitWindowMs = readNumberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);
const globalRateLimitMax = readNumberEnv('RATE_LIMIT_MAX', 100);
const authRateLimitWindowMs = readNumberEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);
const authRateLimitMax = readNumberEnv('AUTH_RATE_LIMIT_MAX', 10);
const enableGlobalRateLimit = process.env.ENABLE_RATE_LIMIT === 'true' || isProduction;
const enableAuthRateLimit = process.env.ENABLE_AUTH_RATE_LIMIT === 'true' || isProduction;

const limiter = rateLimit({
  windowMs: globalRateLimitWindowMs,
  max: globalRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: createJsonRateLimitMessage(
    globalRateLimitWindowMs,
    'Too many requests from this IP, please try again later',
  ),
});

const authLimiter = rateLimit({
  windowMs: authRateLimitWindowMs,
  max: authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: createJsonRateLimitMessage(
    authRateLimitWindowMs,
    'Too many authentication attempts from this IP, please try again later',
  ),
});

// Security: CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Security: JSON parser with content-type check
app.use((req, res, next) => {
  if (req.is('application/json') || req.method === 'GET') {
    express.json({ limit: '1mb' })(req, res, next);
  } else {
    res.status(415).json({ error: 'Content-Type must be application/json' });
  }
});

if (enableGlobalRateLimit) {
  app.use(limiter);
}

if (enableAuthRateLimit) {
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}

// Authentication middleware for sensitive endpoints
app.post('/api/flow/execute', authMiddleware);
app.post('/api/flow/execute/stream', authMiddleware);
app.get('/api/flows', authMiddleware);
app.get('/api/flows/:id', authMiddleware);
app.get('/api/flows/:id/versions', authMiddleware);
app.get('/api/flows/:id/versions/:versionId', authMiddleware);
app.post('/api/flows', authMiddleware);
app.post('/api/flows/:id/versions/:versionId/restore', authMiddleware);
app.delete('/api/flows/:id', authMiddleware);

app.use('/', rootRouter);

app.listen(port, () => {
  console.log(`[n2flow] SQL server is running at http://localhost:${port}`);
});
