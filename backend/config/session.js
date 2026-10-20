import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';

export const configureSession = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSecret =
    process.env.SESSION_SECRET || 'dev_insecure_task_manager_secret_key_change_in_prod_123456';
  const sessionStoreType = process.env.SESSION_STORE || (isProduction ? 'postgres' : 'memory');

  let store;

  if (isProduction || sessionStoreType === 'postgres') {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      if (isProduction) {
        throw new Error(
          'FATAL: DATABASE_URL environment variable is required for PostgreSQL session storage in production. Silent fallback to memory storage is disallowed.'
        );
      } else {
        console.warn(
          '[Session] SESSION_STORE=postgres requested but DATABASE_URL missing. Using MemoryStore for local development.'
        );
        store = new session.MemoryStore();
      }
    } else {
      const pgSession = connectPgSimple(session);
      const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
      });

      pool.on('error', (err) => {
        console.error('[Session] PostgreSQL connection error in session pool:', err);
      });

      store = new pgSession({
        pool,
        tableName: 'user_sessions',
        createTableIfMissing: true,
        ttl: 60 * 60 * 24 * 7,
      });
      console.log('[Session] PostgreSQL persistent session store initialized.');
    }
  } else {
    store = new session.MemoryStore();
    console.log('[Session] Development MemoryStore session initialized.');
  }

  return session({
    store,
    name: 'ttm.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    },
  });
};
