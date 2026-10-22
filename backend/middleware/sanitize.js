
const UNTOUCHED_KEYS = new Set(['password', 'confirmPassword']);

const cleanString = (value) => value.replace(/\0/g, '').replace(/<[^>]*>/g, '');

const cleanValue = (value, key) => {
  if (typeof value === 'string') {
    return UNTOUCHED_KEYS.has(key) ? value : cleanString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => cleanValue(item, key));
  }
  if (value && typeof value === 'object') {
    const result = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey.startsWith('$') || childKey.includes('.')) continue;
      result[childKey] = cleanValue(childValue, childKey);
    }
    return result;
  }
  return value;
};

export const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = cleanValue(req.body);
  if (req.query) req.query = cleanValue(req.query);
  if (req.params) req.params = cleanValue(req.params);
  next();
};
