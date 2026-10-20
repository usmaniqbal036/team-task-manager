import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, _req, res, _next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  console.error('[Error Handler]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    return sendError(res, 'Database validation failed.', 400, errors);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `A record with this ${field} already exists.`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 'Invalid resource identifier format.', 400);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = isProduction
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

export const notFoundHandler = (_req, res) => {
  return sendError(res, 'API route not found.', 404);
};
