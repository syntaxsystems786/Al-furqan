"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingBag, Minus, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { fetchProductById } from '@/lib/api';
import ScentStructure from '@/components/ScentStructure';
import { motion } from 'framer-motion';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop';

export default function ProductDetail() {
  const params = useParams();
  const id = Number(params?.id);

  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id)
      .then(data => {
        setProduct(data);
        if (data.variations?.length > 0) {
          setSelectedSize(data.variations[0].size);
          setSelectedVariationId(data.variations[0].id);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSizeSelect = (variation: any) => {
    setSelectedSize(variation.size);
    setSelectedVariationId(variation.id);
    setQuantity(1); // reset quantity when switching size
    setError(null);
  };

  const selectedVariation = product?.variations?.find((v: any) => v.id === selectedVariationId);
  const maxStock = selectedVariation?.stock ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (maxStock === 0) {
      setError('This volume is out of stock.');
      return;
    }
    if (quantity > maxStock) {
      setError(`Only ${maxStock} items available in this volume.`);
      return;
    }
    setError(null);
    addToCart({
      id: `${product.id}-${selectedVariationId || 'OS'}`,
      productId: product.id,
      variationId: selectedVariationId,
      name: product.name,
      price: product.price,
      size: selectedSize || 'OS',
      quantity,
      image: product.images?.[0]?.url ? `http://localhost:4000${product.images[0].url}` : `/perfumes/p${(product.id % 5) + 1}.jpeg`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="w-full min-h-[60vh] bg-[#FAFAF8] flex items-center justify-center">
      <p className="text-[#8C7A6B] text-sm tracking-[0.3em] uppercase font-bold">Unveiling Scent...</p>
    </div>
  );

  if (!product) return (
    <div className="w-full min-h-[60vh] bg-[#FAFAF8] flex items-center justify-center flex-col gap-6">
      <p className="text-2xl text-gray-400 font-serif tracking-widest uppercase">Fragrance Not Found</p>
      <Link href="/products" className="text-[#8C7A6B] text-sm tracking-[0.2em] hover:opacity-70 transition-opacity uppercase border-b border-[#8C7A6B] pb-1 font-bold">Return to Collection</Link>
    </div>
  );

  const imageId = (product.id % 5) + 1;
  const image = product.images?.[0]?.url ? `http://localhost:4000${product.images[0].url}` : `/perfumes/p${imageId}.jpeg`;
  const sizes = product.variations || [];

  return (
    <div className="w-full bg-[#FAFAF8] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-24 py-12">
        {/* Breadcrumb */}
        <Link href="/products" className="inline-flex items-center space-x-3 text-gray-400 hover:text-[#8C7A6B] transition-colors mb-12 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase">Back to Collection</span>
        </Link>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 relative">
          {/* Sticky Left Image Column */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32 lg:h-[calc(100vh-10rem)]">
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full aspect-[3/4] lg:aspect-auto bg-white border border-[#8C7A6B]/10 overflow-hidden group"
            >
              <img
                src={image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-90 mix-blend-multiply group-hover:scale-110 transition-transform duration-[2s] ease-out"
              />
              {product.category && (
                <div className="absolute top-6 left-6 bg-[#FAFAF8]/90 backdrop-blur-sm border border-[#8C7A6B]/20 px-6 py-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#8C7A6B]">{product.category.name}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Scrolling Right Info Column */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start py-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] mb-6 uppercase tracking-widest leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-light text-[#8C7A6B] tracking-widest mb-8">Rs. {product.price?.toLocaleString()}</p>

            {product.description && (
              <p className="text-gray-500 mb-10 leading-relaxed text-lg font-light border-t border-[#8C7A6B]/15 pt-8 tracking-wide">
                {product.description}
              </p>
            )}

            <ScentStructure 
              topNotes={product.topNotes} 
              middleNotes={product.middleNotes} 
              baseNotes={product.baseNotes} 
            />

            {/* Volume Selection */}
            {sizes.length > 0 && (
              <div className="mb-10 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#8C7A6B]">
                    Select Volume: <span className="text-[#1A1A1A]">{selectedSize}</span>
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {sizes.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => handleSizeSelect(v)}
                      disabled={v.stock === 0}
                      className={`min-w-[5rem] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${
                        selectedVariationId === v.id
                          ? 'border-[#8C7A6B] bg-[#8C7A6B] text-[#FAFAF8]'
                          : v.stock === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-[#8C7A6B]/30 text-[#1A1A1A] hover:border-[#8C7A6B]'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
                {selectedVariationId && (
                  <p className="text-xs text-[#8C7A6B]/60 mt-4 tracking-widest font-bold">
                    {sizes.find((v: any) => v.id === selectedVariationId)?.stock || 0} pieces available
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-12">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-4">Quantity</h3>
              <div className="flex items-center border border-[#8C7A6B]/30 w-40 hover:border-[#8C7A6B] transition-colors">
                <button
                  onClick={() => { setQuantity(Math.max(1, quantity - 1)); setError(null); }}
                  className="p-4 text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-bold text-lg text-[#1A1A1A]">{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity >= maxStock) {
                      setError(`Only ${maxStock} items available in this volume.`);
                    } else {
                      setQuantity(quantity + 1);
                      setError(null);
                    }
                  }}
                  disabled={quantity >= maxStock}
                  className="p-4 text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {error && <p className="text-red-500 text-xs font-bold tracking-wide mt-3">{error}</p>}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center space-x-3 py-5 px-8 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                  added
                    ? 'bg-[#8C7A6B] text-[#FAFAF8]'
                    : 'bg-[#1A1A1A] text-[#FAFAF8] hover:bg-[#8C7A6B]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? 'Added to Bag' : 'Acquire'}</span>
              </button>

              <Link
                href="/cart"
                className="flex-1 flex items-center justify-center py-5 px-8 border border-[#8C7A6B]/30 text-[#1A1A1A] text-xs font-bold tracking-[0.2em] uppercase hover:border-[#8C7A6B] hover:text-[#8C7A6B] transition-all duration-300"
              >
                Checkout
              </Link>
            </div>

            {/* Details */}
            <div className="border-t border-[#8C7A6B]/15 pt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-white border border-[#8C7A6B]/10 shadow-sm">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-3">Authenticity</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed">100% authentic ingredients sourced globally. Each bottle is meticulously crafted and sealed.</p>
              </div>
              <div className="p-6 bg-white border border-[#8C7A6B]/10 shadow-sm">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-3">Shipping & Returns</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed">Complimentary overnight shipping on all orders. Returns accepted within 7 days if sealed.</p>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
