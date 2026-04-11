import { prisma } from '../config/db.js'

// GET /products - Get all products (paginated)
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const products = await prisma.product.findMany({
            where: { is_deleted: false },
            include: { category: true },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.product.count({ where: { is_deleted: false } });

        res.status(200).json({
            products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// GET /products/:id - Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });

        if (!product || product.is_deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ product });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching product" });
    }
};

// GET /products/search?q= - Search products
export const productSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({ message: "Search query is required" });
        }

        const products = await prisma.product.findMany({
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
            include: { category: true }
        });

        res.status(200).json({
            query: q,
            count: products.length,
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error searching products" });
    }
};

// POST /products - Admin: Create product
export const createProduct = async (req, res) => {
    try {
        const { name, slug, description, price, compare_price, category_id, stock_qty, images } = req.body;

        if (!name || !slug || !price) {
            return res.status(400).json({ message: "Name, slug, and price are required" });
        }

        // Check if slug already exists
        const existingProduct = await prisma.product.findUnique({ where: { slug } });
        if (existingProduct) {
            return res.status(400).json({ message: "Slug already exists" });
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: parseFloat(price),
                compare_price: compare_price ? parseFloat(compare_price) : null,
                category_id,
                stock_qty: stock_qty || 0,
                images: images || null
            },
            include: { category: true }
        });

        res.status(201).json({
            product,
            message: "Product created successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating product" });
    }
};

// PUT /products/:id - Admin: Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, price, compare_price, category_id, stock_qty, images } = req.body;

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.is_deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if new slug already exists (exclude current product)
        if (slug && slug !== product.slug) {
            const existingSlug = await prisma.product.findUnique({ where: { slug } });
            if (existingSlug) {
                return res.status(400).json({ message: "Slug already exists" });
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
                ...(stock_qty !== undefined && { stock_qty }),
                ...(images !== undefined && { images })
            },
            include: { category: true }
        });

        res.status(200).json({
            product: updatedProduct,
            message: "Product updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating product" });
    }
};

// DELETE /products/:id - Admin: Soft delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const deletedProduct = await prisma.product.update({
            where: { id },
            data: { is_deleted: true },
            include: { category: true }
        });

        res.status(200).json({
            product: deletedProduct,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting product" });
    }
};