export const sendSuccess = (res, data, message, statusCode = 200) => {
  const payload = {
    success: true,
  };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  return res.status(statusCode).json(payload);
};

export const sendError = (res, message, statusCode = 400, errors) => {
  const payload = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
