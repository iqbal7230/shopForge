import { prisma } from '../config/db.js';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '../utils/response.js';
import { ERROR_MESSAGES, PAGINATION_DEFAULTS } from '../utils/constants.js';

export const createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      return errorResponse(res, 400, 'Category slug already exists', 'SLUG_EXISTS');
    }

    const category = await prisma.category.create({
      data: { name, slug, parent_id: parent_id || null }
    });

    createdResponse(res, category, 'Category created successfully');
  } catch (error) {
    console.error('Create category error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'CREATE_CATEGORY_ERROR');
  }
};

export const getCategories = async (req, res) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT } = req.query;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: parseInt(limit),
        include: { children: true },
        where: { parent_id: null }
      }),
      prisma.category.count()
    ]);

    paginatedResponse(res, categories, page, limit, total, 'Categories retrieved');
  } catch (error) {
    console.error('Get categories error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'GET_CATEGORIES_ERROR');
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true, products: { take: 10 } }
    });

    if (!category) {
      return errorResponse(res, 404, ERROR_MESSAGES.CATEGORY_NOT_FOUND, 'NOT_FOUND');
    }

    successResponse(res, 200, category, 'Category retrieved');
  } catch (error) {
    console.error('Get category error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'GET_CATEGORY_ERROR');
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return errorResponse(res, 404, ERROR_MESSAGES.CATEGORY_NOT_FOUND, 'NOT_FOUND');
    }

    if (slug && slug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({ where: { slug } });
      if (existingSlug) {
        return errorResponse(res, 400, 'Category slug already exists', 'SLUG_EXISTS');
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(parent_id !== undefined && { parent_id: parent_id || null })
      }
    });

    successResponse(res, 200, updated, 'Category updated');
  } catch (error) {
    console.error('Update category error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'UPDATE_CATEGORY_ERROR');
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.findFirst({
      where: { category_id: id }
    });

    if (products) {
      return errorResponse(res, 400, 'Cannot delete category with products', 'HAS_PRODUCTS');
    }

    await prisma.category.delete({ where: { id } });

    successResponse(res, 200, null, 'Category deleted');
  } catch (error) {
    console.error('Delete category error:', error);
    errorResponse(res, 500, ERROR_MESSAGES.INTERNAL_ERROR, 'DELETE_CATEGORY_ERROR');
  }
};
