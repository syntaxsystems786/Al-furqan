"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                variations: true,
                category: true,
                images: true,
            },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                variations: true,
                category: true,
                images: true,
            },
        });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
exports.getProductById = getProductById;
const processImages = async (files) => {
    const imagesData = [];
    const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    for (const file of files) {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const filepath = path_1.default.join(uploadsDir, filename);
        // Compress and convert to webp
        await (0, sharp_1.default)(file.buffer)
            .resize({ width: 1000, withoutEnlargement: true }) // Resize if larger than 1000px wide
            .webp({ quality: 80 }) // Convert to WebP and compress
            .toFile(filepath);
        imagesData.push({ url: `/uploads/${filename}` });
    }
    return imagesData;
};
const createProduct = async (req, res) => {
    try {
        const { name, description, topNotes, middleNotes, baseNotes, price, categoryId } = req.body;
        let variations = [];
        if (req.body.variations) {
            try {
                variations = typeof req.body.variations === 'string' ? JSON.parse(req.body.variations) : req.body.variations;
            }
            catch (e) {
                console.error("Failed to parse variations");
            }
        }
        const files = req.files;
        let imagesData = [];
        if (files && files.length > 0) {
            imagesData = await processImages(files);
        }
        const product = await prisma.product.create({
            data: {
                name,
                description,
                topNotes,
                middleNotes,
                baseNotes,
                price: parseFloat(price),
                categoryId: categoryId ? parseInt(categoryId) : null,
                variations: {
                    create: variations.map((v) => ({
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock)
                    })),
                },
                images: {
                    create: imagesData
                }
            },
            include: {
                variations: true,
                images: true,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, topNotes, middleNotes, baseNotes, price, categoryId } = req.body;
        // Update basic info
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                topNotes,
                middleNotes,
                baseNotes,
                price: parseFloat(price),
                categoryId: categoryId ? parseInt(categoryId) : null
            },
            include: {
                images: true,
            }
        });
        // Handle new images if any
        const files = req.files;
        if (files && files.length > 0) {
            // Remove old images first so the new one replaces them
            await prisma.productImage.deleteMany({
                where: { productId: product.id }
            });
            const newImages = await processImages(files);
            const imagesData = newImages.map(img => ({ url: img.url, productId: product.id }));
            await prisma.productImage.createMany({
                data: imagesData
            });
        }
        // Handle variations if passed
        if (req.body.variations) {
            try {
                const variations = typeof req.body.variations === 'string' ? JSON.parse(req.body.variations) : req.body.variations;
                await prisma.productVariation.deleteMany({
                    where: { productId: product.id }
                });
                await prisma.productVariation.createMany({
                    data: variations.map((v) => ({
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock),
                        productId: product.id
                    }))
                });
            }
            catch (e) {
                console.error("Failed to parse variations on update");
            }
        }
        const updated = await prisma.product.findUnique({
            where: { id: product.id },
            include: { variations: true, images: true }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
