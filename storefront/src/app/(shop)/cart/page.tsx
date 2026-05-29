"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { submitCheckout } from '@/lib/api';
import { motion } from 'framer-motion';

const inputClass = "w-full bg-white border border-[#8C7A6B]/30 text-[#1A1A1A] p-4 focus:border-[#8C7A6B] focus:outline-none transition-colors placeholder-gray-400";
const labelClass = "block text-xs font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-2";

export default function Cart() {
  const { cart: cartItems, removeFromCart, updateQuantity, cartTotal, isLoaded, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', paymentMethod: 'Cash on Delivery'
  });
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <p className="text-[#8C7A6B] font-bold tracking-[0.3em] uppercase text-sm">Loading...</p>
    </div>
  );

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);
    setError(null);
    try {
      const result = await submitCheckout({
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.productId,
          productVariationId: item.variationId ?? null,
          productName: item.name,
          productSize: item.size,
          productColor: 'Standard',
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      });
      if (result.error) throw new Error(result.error);
      setCheckoutStep('success');
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0 && checkoutStep !== 'success') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-[#8C7A6B]/30 mb-6" />
        <h1 className="text-3xl font-serif text-[#1A1A1A] tracking-[0.2em] uppercase mb-4">Your Bag is Empty</h1>
        <p className="text-gray-500 mb-8 font-light tracking-wide">Explore our collections to find your signature scent.</p>
        <Link href="/products" className="px-8 py-4 border border-[#8C7A6B] text-[#8C7A6B] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8C7A6B] hover:text-[#FAFAF8] transition-colors">
          Explore Fragrances
        </Link>
      </div>
    );
  }

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-[#8C7A6B]/10 flex items-center justify-center mb-8 border border-[#8C7A6B]/30 mx-auto">
            <svg className="w-10 h-10 text-[#8C7A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-serif text-[#1A1A1A] tracking-[0.2em] uppercase mb-4">Order Confirmed</h1>
          <p className="text-gray-500 mb-10 font-light tracking-wide max-w-md mx-auto">
            Your acquisition is confirmed. A confirmation will be sent shortly.
          </p>
          <Link href="/products" className="px-8 py-4 border border-[#8C7A6B] text-[#8C7A6B] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8C7A6B] hover:text-[#FAFAF8] transition-colors">
            Continue Exploring
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12">
        <h1 className="text-3xl sm:text-5xl font-serif text-[#1A1A1A] tracking-[0.1em] sm:tracking-[0.2em] uppercase mb-16">
          {checkoutStep === 'cart' ? 'Your Bag' : 'Checkout'}
        </h1>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column */}
          <div className="flex-1">
            {checkoutStep === 'cart' ? (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.id} 
                    className="flex gap-6 border-b border-[#8C7A6B]/15 pb-8 relative group"
                  >
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-0 right-0 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="w-32 aspect-[4/5] relative bg-white overflow-hidden border border-[#8C7A6B]/10 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <h3 className="text-xl font-serif text-[#1A1A1A] tracking-widest uppercase mb-1">{item.name}</h3>
                        <p className="text-[#8C7A6B] text-xs tracking-[0.2em] uppercase font-bold">Volume: {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#8C7A6B]/30">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-bold text-sm text-[#1A1A1A]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-lg font-medium text-[#8C7A6B] tracking-widest">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-[#8C7A6B]/15 p-8 shadow-sm"
              >
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Delivery Address</label>
                    <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Cash on Delivery', 'JazzCash', 'EasyPaisa', 'Bank Transfer'].map((method) => (
                        <label key={method} className={`flex items-center justify-center p-4 border cursor-pointer transition-colors ${formData.paymentMethod === method ? 'border-[#8C7A6B] bg-[#8C7A6B]/5 text-[#8C7A6B]' : 'border-[#8C7A6B]/20 text-[#1A1A1A] hover:border-[#8C7A6B]/50'}`}>
                          <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="hidden" />
                          <span className="text-xs font-bold tracking-[0.1em] uppercase">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {error && (
                    <div className="p-4 border border-red-300 bg-red-50 text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white border border-[#8C7A6B]/15 p-8 sticky top-32 shadow-sm">
              <h2 className="text-xl font-serif text-[#1A1A1A] tracking-widest uppercase mb-6 pb-6 border-b border-[#8C7A6B]/15">Order Summary</h2>
              <div className="space-y-4 mb-6 text-sm font-light text-gray-600 tracking-wide">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#8C7A6B] font-bold">Free</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-[#8C7A6B]/15 mb-8">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">Total</span>
                <span className="text-2xl font-serif text-[#8C7A6B] tracking-widest">Rs. {cartTotal.toLocaleString()}</span>
              </div>

              {checkoutStep === 'cart' ? (
                <button 
                  onClick={() => setCheckoutStep('details')}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-[#1A1A1A] text-[#FAFAF8] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8C7A6B] transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-4">
                  <button 
                    type="submit"
                    form="checkout-form"
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-[#1A1A1A] text-[#FAFAF8] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8C7A6B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? 'Processing...' : 'Confirm Order'}
                  </button>
                  <button 
                    onClick={() => setCheckoutStep('cart')}
                    className="w-full py-4 border border-[#8C7A6B]/30 text-[#1A1A1A] text-xs font-bold tracking-[0.2em] uppercase hover:border-[#8C7A6B] hover:text-[#8C7A6B] transition-colors"
                  >
                    Back to Bag
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
