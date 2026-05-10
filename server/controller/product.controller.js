import { prisma } from '../config/db.js';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '../utils/response.js';
import { ERROR_MESSAGES, PAGINATION_DEFAULTS } from '../utils/constants.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, category_id, min_price, max_price, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    const where = { is_deleted: false };
    if (category_id) where.category_id = category_id;
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price.gte = parseFloat(min_price);
      if (max_price) where.price.lte = parseFloat(max_price);
    }

    const orderBy = sort === 'price_low' ? { price: 'asc' } : sort === 'price_high' ? { price: 'desc' } : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    paginatedResponse(res, products, page, limit, total, 'Products retrieved');
  } catch (error) {
    console.error('Get products error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'GET_PRODUCTS_ERROR');
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        reviews: { include: { user: { select: { id: true, full_name: true } } }, take: 10 },
        cart_items: false,
        order_items: false
      }
    });

    if (!product || product.is_deleted) {
      return errorResponse(res, 404, ERROR_MESSAGES.PRODUCT_NOT_FOUND, 'NOT_FOUND');
    }

    const avgRating = await prisma.review.aggregate({
      where: { product_id: id },
      _avg: { rating: true },
      _count: { id: true }
    });

    successResponse(res, 200, {
      ...product,
      average_rating: avgRating._avg.rating || 0,
      review_count: avgRating._count.id
    }, 'Product retrieved');
  } catch (error) {
    console.error('Get product error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'GET_PRODUCT_ERROR');
  }
};

export const productSearch = async (req, res) => {
  try {
    const { q, page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT } = req.query;

    if (!q || q.trim() === '') {
      return errorResponse(res, 400, 'Search query is required', 'REQUIRED_FIELD');
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          AND: [
            { is_deleted: false },
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: { category: true, variants: true },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({
        where: {
          AND: [
            { is_deleted: false },
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } }
              ]
            }
          ]
        }
      })
    ]);

    paginatedResponse(res, products, page, limit, total, `Search results for "${q}"`);
  } catch (error) {
    console.error('Product search error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'SEARCH_ERROR');
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, compare_price, category_id, stock_qty } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return errorResponse(res, 400, 'Product slug already exists', 'SLUG_EXISTS');
    }

    let images = null;
    if (req.files && req.files.length > 0) {
      images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        images.push(result.url);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        compare_price: compare_price ? parseFloat(compare_price) : null,
        category_id: category_id || null,
        stock_qty: parseInt(stock_qty) || 0,
        images: images ? { urls: images } : null
      },
      include: { category: true }
    });

    createdResponse(res, product, 'Product created successfully');
  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'CREATE_PRODUCT_ERROR');
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, compare_price, category_id, stock_qty } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.is_deleted) {
      return errorResponse(res, 404, ERROR_MESSAGES.PRODUCT_NOT_FOUND, 'NOT_FOUND');
    }

    if (slug && slug !== product.slug) {
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug) {
        return errorResponse(res, 400, 'Product slug already exists', 'SLUG_EXISTS');
      }
    }

    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = { urls: [] };
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        images.urls.push(result.url);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(compare_price !== undefined && { compare_price: compare_price ? parseFloat(compare_price) : null }),
        ...(category_id !== undefined && { category_id }),
        ...(stock_qty !== undefined && { stock_qty: parseInt(stock_qty) }),
        ...(images && { images })
      },
      include: { category: true }
    });

    successResponse(res, 200, updatedProduct, 'Product updated');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'UPDATE_PRODUCT_ERROR');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return errorResponse(res, 404, ERROR_MESSAGES.PRODUCT_NOT_FOUND, 'NOT_FOUND');
    }

    const deletedProduct = await prisma.product.update({
      where: { id },
      data: { is_deleted: true },
      include: { category: true }
    });

    successResponse(res, 200, deletedProduct, 'Product deleted');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'DELETE_PRODUCT_ERROR');
  }
};