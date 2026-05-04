import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import rootRouter from './routes';
import { authMiddleware } from './middleware/auth';
import { LogSanitizer, installGlobalLogSanitizer } from './middleware/logSanitizer';

const app = express();
const port = Number(process.env.SQL_SERVER_PORT || 8787);

// Enable global log sanitization if requested
if (process.env.ENABLE_LOG_SANITIZATION === 'true') {
  installGlobalLogSanitizer();
}

// Security: Rate limiting to prevent DoS/Brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
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

// Apply rate limiting to all requests
app.use(limiter);

// Authentication middleware for sensitive endpoints
app.post('/api/flow/execute', authMiddleware);
app.post('/api/flow/execute/stream', authMiddleware);
app.post('/api/flows', authMiddleware);
app.delete('/api/flows/:id', authMiddleware);

app.use('/', rootRouter);

app.listen(port, () => {
  console.log(`[n2flow] SQL server is running at http://localhost:${port}`);
});
