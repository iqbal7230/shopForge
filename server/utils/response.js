export const successResponse = (res, status = 200, data = null, message = 'Success', pagination = null) => {
  const response = {
    success: true,
    data,
    message
  };

  if (pagination) {
    response.pagination = pagination;
  }

  res.status(status).json(response);
};

export const errorResponse = (res, status = 400, message = 'Error', code = 'ERROR', errors = null) => {
  const response = {
    success: false,
    message,
    code
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(status).json(response);
};

export const createdResponse = (res, data, message = 'Created successfully') => {
  res.status(201).json({
    success: true,
    data,
    message
  });
};

export const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  res.status(200).json({
    success: true,
    data,
    message,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};
