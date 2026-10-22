import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './expressApp.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const app = createApp();

  app.use(notFoundHandler);

  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`[Backend Server] Team Task Manager API running on port ${PORT}`);
    console.log(`[Backend Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = () => {
    console.log('[Backend Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Backend Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[Backend Server] Fatal startup error:', err);
  process.exit(1);
});
