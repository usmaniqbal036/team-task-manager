import { createApp } from '../expressApp.js';

const app = createApp();
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from '../expressApp.js';
import { connectDB } from '../config/db.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

let appPromise;

async function init() {
  await connectDB();
  const app = createApp();
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export default async function handler(req, res) {
  try {
    appPromise = appPromise || init();
    const app = await appPromise;
    return app(req, res);
  } catch (err) {
    appPromise = undefined;
    console.error('[Vercel] Init failed:', err);
    res.status(500).json({ message: 'Server initialization failed' });
  }
}
