export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.details?.map(d => ({ field: d.path.join('.'), message: d.message })),
      code: 'VALIDATION_ERROR'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Default error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    success: false,
    message,
    code
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    code: 'NOT_FOUND'
  });
};
