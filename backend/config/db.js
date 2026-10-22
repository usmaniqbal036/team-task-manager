import dns from 'node:dns';
import mongoose from 'mongoose';
import { memoryDb } from '../services/dataStore.js';

const isProduction = () => process.env.NODE_ENV === 'production';

// Development-only fallback: in-memory store pre-filled with demo users/teams/tasks.
const useDevelopmentMemoryStore = async (reason) => {
  console.log(`[Database] ${reason} Using the in-memory store (development only).`);
  await memoryDb.initSeed();
  return false;
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const dnsServers = process.env.MONGODB_DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (!mongoUri) {
    if (isProduction()) {
      throw new Error(
        'FATAL: MONGODB_URI is required in production. Refusing to start with the in-memory demo store.'
      );
    }
    return useDevelopmentMemoryStore('MONGODB_URI not provided.');
  }

  try {
    if (dnsServers?.length) {
      dns.setServers(dnsServers);
    }
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log('[Database] Successfully connected to MongoDB');
    return true;
  } catch (error) {
    if (isProduction()) {
      throw new Error(`FATAL: could not connect to MongoDB in production: ${error.message}`);
    }
    console.warn('[Database] Failed to connect to MongoDB:', error.message);
    return useDevelopmentMemoryStore('Connection failed.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error:', err);
});
