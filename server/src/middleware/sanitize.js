// SQL injection prevention utilities
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes, semicolons, and backslashes
    .replace(/--/g, '') // Remove SQL comment syntax
    .replace(/\/\*|\*\//g, '') // Remove SQL block comments
    .trim();
};

// Sanitize object properties recursively
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = typeof obj[key] === 'string'
        ? sanitizeInput(obj[key])
        : sanitizeObject(obj[key]);
    }
  }

  return sanitized;
};

// Middleware to sanitize request body
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware to sanitize request parameters
const sanitizeParams = (req, res, next) => {
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Middleware to sanitize query parameters
const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery
};