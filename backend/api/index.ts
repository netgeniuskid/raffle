import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { authRouter } from '../src/routes/auth';
import { adminRouter } from '../src/routes/admin';
import { gameRouter } from '../src/routes/game';
import { errorHandler } from '../src/middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());

// Simple CORS configuration for Vercel
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://frontend-topaz-two-51.vercel.app",
    "https://frontend-e126ryr8f-vangelis-projects-4e7374cc.vercel.app",
    "https://frontend-515qghz9t-vangelis-projects-4e7374cc.vercel.app",
    "https://frontend-4t3mnnf0l-vangelis-projects-4e7374cc.vercel.app"
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || origin?.includes('frontend-') && origin?.includes('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Also use cors middleware as backup
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/games', gameRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel
export default app;
