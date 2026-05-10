import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    fullname: Joi.string().required().messages({
      'string.empty': 'Full name is required',
      'any.required': 'Full name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters'
    })
  })
};

export const productSchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Product name is required'
    }),
    slug: Joi.string().required().messages({
      'any.required': 'Product slug is required'
    }),
    description: Joi.string().allow(''),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Price must be greater than 0',
      'any.required': 'Price is required'
    }),
    compare_price: Joi.number().positive().allow(null),
    category_id: Joi.string().uuid().allow(null),
    stock_qty: Joi.number().min(0).required()
  }),

  update: Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    description: Joi.string().allow(''),
    price: Joi.number().positive(),
    compare_price: Joi.number().positive().allow(null),
    category_id: Joi.string().uuid().allow(null),
    stock_qty: Joi.number().min(0)
  })
};

export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Category name is required'
    }),
    slug: Joi.string().required().messages({
      'any.required': 'Category slug is required'
    }),
    parent_id: Joi.string().uuid().allow(null)
  }),

  update: Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    parent_id: Joi.string().uuid().allow(null)
  })
};

export const cartSchemas = {
  addItem: Joi.object({
    product_id: Joi.string().uuid().required(),
    variant_id: Joi.string().uuid().allow(null),
    quantity: Joi.number().min(1).required().messages({
      'number.min': 'Quantity must be at least 1'
    })
  }),

  updateItem: Joi.object({
    quantity: Joi.number().min(1).required().messages({
      'number.min': 'Quantity must be at least 1'
    })
  })
};

export const reviewSchemas = {
  create: Joi.object({
    product_id: Joi.string().uuid().required(),
    rating: Joi.number().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5'
    }),
    title: Joi.string().allow(''),
    content: Joi.string().allow('')
  })
};

export const checkoutSchemas = {
  create: Joi.object({
    address_id: Joi.string().uuid().allow(null),
    full_name: Joi.string().required(),
    phone: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
    country: Joi.string().required(),
    shipping_method: Joi.string().valid('FLAT', 'WEIGHT').required(),
    coupon_code: Joi.string().allow(null)
  }),

  confirmPayment: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required()
  })
};

export const addressSchemas = {
  create: Joi.object({
    full_name: Joi.string().required(),
    phone: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
    country: Joi.string().required(),
    is_default: Joi.boolean()
  }),

  update: Joi.object({
    full_name: Joi.string(),
    phone: Joi.string(),
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    postal_code: Joi.string(),
    country: Joi.string(),
    is_default: Joi.boolean()
  })
};

export const userSchemas = {
  updateProfile: Joi.object({
    full_name: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email()
  })
};

export const couponSchemas = {
  create: Joi.object({
    code: Joi.string().required().uppercase(),
    type: Joi.string().valid('PERCENT', 'FIXED').required(),
    value: Joi.number().positive().required(),
    min_purchase: Joi.number().positive().allow(null),
    max_discount: Joi.number().positive().allow(null),
    usage_limit: Joi.number().positive().allow(null),
    expires_at: Joi.date().allow(null)
  })
};

export const variantSchemas = {
  create: Joi.object({
    product_id: Joi.string().uuid().required(),
    sku: Joi.string().required(),
    size: Joi.string().allow(null),
    color: Joi.string().allow(null),
    stock: Joi.number().min(0).required(),
    price: Joi.number().positive().allow(null)
  })
};
