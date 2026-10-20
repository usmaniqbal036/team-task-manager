import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log(
      '[Database] MONGODB_URI not provided. Using the non-persistent in-memory document store.'
    );
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log('[Database] Successfully connected to MongoDB Atlas');
    return true;
  } catch (error) {
    console.warn('[Database] Failed to connect to MongoDB Atlas:', error.message);
    console.log(
      '[Database] Using the non-persistent in-memory document store; database changes will not be saved.'
    );
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error:', err);
});
