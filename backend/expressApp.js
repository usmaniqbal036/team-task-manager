import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { configureSession } from './config/session.js';
import { configurePassport } from './config/passport.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput } from './middleware/sanitize.js';

import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

export const createApp = () => {
  const app = express();

  
  app.set('trust proxy', true);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.length === 0 ||
          allowedOrigins.includes(origin) ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(new Error('CORS policy: Not allowed by origin'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(sanitizeInput);

  const sessionMiddleware = configureSession();
  app.use(sessionMiddleware);

  const passportInstance = configurePassport();
  app.use(passportInstance.initialize());
  app.use(passportInstance.session());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      sessionStore:
        process.env.SESSION_STORE ||
        (process.env.NODE_ENV === 'production' ? 'postgres' : 'memory'),
    });
  });

  app.use('/api', apiRateLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/users', userRoutes);

  return app;
};
