"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories } from '@/lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const { cartCount, isLoaded } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetchCategories().then(data => setCategories(data)).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#8C7A6B]/20 transition-all duration-300"
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-24">
        <div className="flex justify-between items-center h-28 relative">
          
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-70 transition-opacity">
              <Image src="/logo.png" alt="Al Furqan Perfumes" width={140} height={50} className="object-contain invert brightness-0" />
            </Link>
          </div>
          
          <div className={`hidden lg:flex items-center space-x-10 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Link href="/products" className="text-xs font-bold uppercase tracking-[0.2em] text-[#FAFAF8] hover:text-[#8C7A6B] transition-colors">
              Shop
            </Link>
            {categories.map((c: any) => (
              <Link 
                key={c.id} 
                href={`/products?category=${encodeURIComponent(c.name.toLowerCase())}`} 
                className="text-xs font-bold uppercase tracking-[0.2em] text-[#FAFAF8] hover:text-[#8C7A6B] transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <Link 
              href="/#custom-made" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.querySelector('#custom-made')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-[#FAFAF8] hover:text-[#8C7A6B] transition-colors"
            >
              Custom Made
            </Link>
            <Link 
              href="/#journal" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.querySelector('#journal')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-[#FAFAF8] hover:text-[#8C7A6B] transition-colors"
            >
              Journal
            </Link>
          </div>

          {/* Inline Search Bar */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-full max-w-lg transition-all duration-300 ${isSearchOpen ? 'opacity-100 scale-100 z-50 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none -z-10'}`}>
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-transparent text-[#1A1A1A] placeholder-gray-500 py-3 pl-12 pr-12 focus:outline-none focus:border-[#8C7A6B] font-medium transition-colors shadow-sm"
                autoFocus={isSearchOpen}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C7A6B]" />
              <button type="submit" className="hidden">Submit</button>
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8C7A6B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="hidden lg:flex items-center space-x-8 text-[#FAFAF8]">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-[#8C7A6B] transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <Link href="/cart" className="relative hover:text-[#8C7A6B] transition-colors">
              <ShoppingBag className="w-4 h-4" />
              {isLoaded && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8C7A6B] text-[#FAFAF8] text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button 
            className={`lg:hidden text-[#FAFAF8] hover:text-[#8C7A6B] transition-colors ${isSearchOpen ? 'hidden' : 'block'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FAFAF8] border-b border-[#8C7A6B]/15 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6 flex flex-col items-center">
              <Link href="/products" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8C7A6B]">
                All Collections
              </Link>
              {categories.map((c: any) => (
                <Link 
                  key={c.id}
                  href={`/products?category=${encodeURIComponent(c.name.toLowerCase())}`} 
                  onClick={() => setIsOpen(false)} 
                  className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8C7A6B]"
                >
                  {c.name}
                </Link>
              ))}
              <Link 
                href="/#custom-made" 
                onClick={(e) => {
                  setIsOpen(false);
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    document.querySelector('#custom-made')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8C7A6B]"
              >
                Custom Made
              </Link>
              <Link 
                href="/#journal" 
                onClick={(e) => {
                  setIsOpen(false);
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    document.querySelector('#journal')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8C7A6B]"
              >
                Journal
              </Link>
              <Link href="/cart" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8C7A6B]">
                Cart {isLoaded && cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
