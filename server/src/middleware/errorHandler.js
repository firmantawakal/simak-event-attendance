const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Validation error (Joi)
  if (err.isJoi) {
    error.status = 400;
    error.message = err.details[0].message;
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    error.status = 409;
    error.message = 'Duplicate entry. This record already exists.';
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.status = 400;
    error.message = 'Invalid reference. Related record not found.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(error.status).json({
      error: error.message
    });
  }

  // Show full error details in development
  res.status(error.status).json({
    error: error.message,
    stack: err.stack,
    details: err
  });
};

module.exports = errorHandler;