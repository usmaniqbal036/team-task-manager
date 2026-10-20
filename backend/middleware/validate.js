import { sendError } from '../utils/responseHandler.js';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const formattedErrors = {};
      error.details.forEach((item) => {
        const key = item.path.join('.');
        formattedErrors[key] = item.message.replace(/['"]/g, '');
      });
      return sendError(
        res,
        'Validation failed. Please correct the errors and try again.',
        400,
        formattedErrors
      );
    }

    req.body = value;
    return next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const formattedErrors = {};
      error.details.forEach((item) => {
        const key = item.path.join('.');
        formattedErrors[key] = item.message.replace(/['"]/g, '');
      });
      return sendError(res, 'Invalid query parameters.', 400, formattedErrors);
    }

    req.query = value;
    return next();
  };
};
