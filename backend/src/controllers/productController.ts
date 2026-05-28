import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variations: true,
        category: true,
        images: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        variations: true,
        category: true,
        images: true,
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const processImages = async (files: Express.Multer.File[]) => {
  const imagesData: { url: string }[] = [];
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  for (const file of files) {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const filepath = path.join(uploadsDir, filename);
    
    // Compress and convert to webp
    await sharp(file.buffer)
      .resize({ width: 1000, withoutEnlargement: true }) // Resize if larger than 1000px wide
      .webp({ quality: 80 }) // Convert to WebP and compress
      .toFile(filepath);
      
    imagesData.push({ url: `/uploads/${filename}` });
  }
  return imagesData;
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, topNotes, middleNotes, baseNotes, price, categoryId } = req.body;
    let variations = [];
    if (req.body.variations) {
      try {
        variations = typeof req.body.variations === 'string' ? JSON.parse(req.body.variations) : req.body.variations;
      } catch (e) {
        console.error("Failed to parse variations");
      }
    }

    const files = req.files as Express.Multer.File[];
    let imagesData: { url: string }[] = [];
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
          create: variations.map((v: any) => ({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, topNotes, middleNotes, baseNotes, price, categoryId } = req.body;
    
    // Update basic info
    const product = await prisma.product.update({
      where: { id: parseInt(id as string) },
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
    const files = req.files as Express.Multer.File[];
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
          data: variations.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock),
            productId: product.id
          }))
        });
      } catch (e) {
        console.error("Failed to parse variations on update");
      }
    }
    
    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variations: true, images: true }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
