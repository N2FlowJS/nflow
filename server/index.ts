import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import rootRouter from './routes';

const app = express();
const port = Number(process.env.SQL_SERVER_PORT || 8787);

// Security: Rate limiting to prevent DoS/Brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Apply rate limiting to all requests
app.use(limiter);

app.use('/', rootRouter);

app.listen(port, () => {
  console.log(`[n2flow] SQL server is running at http://localhost:${port}`);
});
