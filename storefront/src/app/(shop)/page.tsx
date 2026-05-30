"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { fetchProducts } from "@/lib/api";
import { ArrowRight, MessageCircle } from "lucide-react";
// This caches the page and updates it in the background at most once every 15 minutes

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const { scrollYProgress } = useScroll();
  const carouselRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: carouselRef });
  
  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const ySection1 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const [cmsSettings, setCmsSettings] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch CMS Settings
        const settingsRes = await fetch('/api/settings');
        const settings = await settingsRes.json();
        setCmsSettings(settings);

        // Fetch Products
        const data = await fetchProducts();
        
        // Filter featured products based on CMS, or fallback to first 6
        if (settings?.featuredProducts && settings.featuredProducts.length > 0) {
          setFeaturedProducts(data.filter((p: any) => settings.featuredProducts.includes(p.id)));
        } else {
          setFeaturedProducts(data.slice(0, 6)); 
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="w-full bg-[#FBFBFA] selection:bg-[#8C7A6B] selection:text-[#FAFAF8] overflow-hidden">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO — Asymmetric 12-column luxury layout
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[calc(100vh-7rem)] lg:min-h-screen overflow-hidden bg-[#FBFBFA] grid grid-cols-1 lg:grid-cols-12">

        {/* ── Ambient background texture ── */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Warm amber aura on right side */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60vw] h-[70vh] bg-gradient-to-l from-amber-100/60 via-amber-50/20 to-transparent" />
          {/* Subtle vertical rule */}
          <div className="hidden lg:block absolute left-[41.666%] top-[10%] bottom-[10%] w-px bg-[#1C1C1C]/6" />
          {/* Corner filigree — top-left */}
          <svg className="absolute top-8 left-8 w-24 h-24 opacity-10" viewBox="0 0 96 96" fill="none">
            <path d="M4 4 L4 92 M4 4 L92 4" stroke="#1C1C1C" strokeWidth="0.8"/>
            <path d="M4 4 L24 4 L24 24" stroke="#8C7A6B" strokeWidth="0.8" fill="none"/>
          </svg>
          {/* Corner filigree — bottom-right */}
          <svg className="absolute bottom-8 right-8 w-24 h-24 opacity-10" viewBox="0 0 96 96" fill="none">
            <path d="M92 92 L92 4 M92 92 L4 92" stroke="#1C1C1C" strokeWidth="0.8"/>
            <path d="M92 92 L72 92 L72 72" stroke="#8C7A6B" strokeWidth="0.8" fill="none"/>
          </svg>
        </div>

        {/* ── LEFT PANEL — Editorial Typography (5 cols) ── */}
        <div className="relative z-10 lg:col-span-5 flex flex-col justify-center px-8 lg:pl-16 lg:pr-8 pt-32 pb-16 lg:pt-0 lg:pb-0">

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 0.1 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="h-px w-10 bg-[#8C7A6B]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#8C7A6B]"
              style={{ fontFamily: "var(--font-montserrat)",marginTop:5 }}>
              Maison de Parfum · Since 2005
            </span>
          </motion.div>

          {/* Main heading — stacked, ultra-large */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 0.2 }}
              className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.88] tracking-tight text-[#1C1C1C] uppercase"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              Al Furqan
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 0.35 }}
              className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.88] tracking-tight text-[#8C7A6B] uppercase italic"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              Perfumes
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 0.55 }}
            className="text-sm md:text-base text-[#555] leading-[1.85] tracking-wide max-w-[360px] mb-12"
            style={{ fontFamily: "var(--font-montserrat)", fontWeight: 300 }}
          >
            Crafted in Karachi.&nbsp; Inspired by French Elegance.
            <br />
            <em className="not-italic text-[#8C7A6B]">The Art of Liquid Emotion.</em>
          </motion.p>

          {/* CTA buttons row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 0.7 }}
            className="flex flex-wrap items-center gap-5"
          >
            <Link
              href="/products"
              className="group relative border border-[#1C1C1C] text-[#1C1C1C] text-xs tracking-[0.2em] uppercase px-8 py-3.5 bg-transparent overflow-hidden transition-all duration-500 ease-out hover:text-white"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              <span className="absolute inset-0 bg-[#1C1C1C] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10">Explore Collection</span>
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2.5 text-xs tracking-[0.2em] uppercase text-[#8C7A6B] hover:gap-4 transition-all duration-300"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              <span>View Lookbook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 0.9 }}
            className="flex gap-10 mt-16 pt-8 border-t border-[#1C1C1C]/8"
          >
            {[["50+", "Fragrances"], ["100%", "Natural Oils"], ["6", "Collections"]].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl text-[#1C1C1C] mb-0.5"
                   style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{num}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#8C7A6B]"
                   style={{ fontFamily: "var(--font-montserrat)" }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT PANEL — Levitating Bottle Showcase (7 cols) ── */}
        <div className="relative z-10 lg:col-span-7 flex items-center justify-center">

          {/* Ambient radial aura */}
          <div className="absolute w-[520px] h-[520px] bg-gradient-to-tr from-amber-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

          {/* Levitating bottle */}
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-[280px] sm:w-[320px] lg:w-[380px] xl:w-[420px] aspect-[3/4]"
          >
            {/* Bottle drop shadow — dual layer contact shadow */}
            <motion.div
              animate={{ scaleX: [1, 0.82, 1], opacity: [0.4, 0.2, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[45%] h-4 bg-[#1C1C1C] blur-[12px] rounded-full"
            />
            <motion.div
              animate={{ scaleX: [1, 0.82, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-[25%] h-2 bg-[#1C1C1C] blur-[6px] rounded-full"
            />
            <Image
              src={cmsSettings?.heroImageUrl || "/perfumes/p1.png"}
              alt="Al Furqan Signature Bottle"
              fill
              priority
              className="object-contain drop-shadow-2xl mix-blend-multiply"
            />
          </motion.div>

          {/* Floating badge — top right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 1.0 }}
            className="absolute top-[18%] right-[8%] lg:right-[5%] flex flex-col items-center text-center bg-white/70 backdrop-blur-lg border border-[#8C7A6B]/15 p-5 w-[110px] shadow-lg"
          >
            <span className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>✦</span>
            <p className="text-[8px] uppercase tracking-[0.25em] text-[#8C7A6B] leading-relaxed"
               style={{ fontFamily: "var(--font-montserrat)" }}>
              New<br/>Arrival
            </p>
          </motion.div>

          {/* Floating note card — bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.2, delay: 1.1 }}
            className="absolute bottom-[15%] left-[5%] lg:left-[3%] bg-white/70 backdrop-blur-lg border border-[#8C7A6B]/15 p-5 max-w-[160px] shadow-lg"
          >
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#8C7A6B] mb-2"
               style={{ fontFamily: "var(--font-montserrat)" }}>Signature Notes</p>
            <p className="text-sm text-[#1C1C1C] leading-snug"
               style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
              Oud · Rose · Amber<br/>Sandalwood · Musk
            </p>
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-[#8C7A6B] to-transparent"
          />
          <span className="text-[8px] uppercase tracking-[0.3em] text-[#8C7A6B]"
                style={{ fontFamily: "var(--font-montserrat)" }}>SCROLL</span>
        </motion.div>
      </section>

      {/* 2. Bestsellers Horizontal Carousel */}
      <section className="py-32 bg-white relative z-10 border-t border-[#8C7A6B]/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row justify-between items-end mb-16"
          >
            <div>
              <motion.h3 variants={fadeUp} className="text-xs font-bold tracking-[0.3em] text-[#8C7A6B] uppercase mb-4">Curated Selection</motion.h3>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-serif text-[#1A1A1A] tracking-tight">The Signature Archives</motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/products" className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#8C7A6B]/30 hover:border-[#8C7A6B] pb-1 transition-colors mt-6 md:mt-0 inline-block">
                View All Fragrances
              </Link>
            </motion.div>
          </motion.div>

          <div ref={carouselRef} className="flex overflow-x-auto hide-scrollbar gap-8 pb-12 snap-x snap-mandatory cursor-grab active:cursor-grabbing relative">
            {featuredProducts.length > 0 ? featuredProducts.map((product, idx) => {
              const imageId = (idx % 5) + 1;
              const hoverImageId = ((idx + 1) % 5) + 1;
              const image = product.images?.[0]?.url
                ? product.images[0].url
                : `/perfumes/p${imageId}.jpeg`;
              const hoverImage = product.images?.[1]?.url
                ? product.images[1].url
                : `/perfumes/p${hoverImageId}.jpeg`;
              return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="snap-start shrink-0 w-[85vw] md:w-[400px] group"
              >
                <Link href={`/products/${product.id}`} className="block relative aspect-[4/5] bg-[#FFFFFF] overflow-hidden mb-6 border border-[#8C7A6B]/10">
                  <img
                    src={image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ease-out group-hover:opacity-0"
                  />
                  <img
                    src={hoverImage}
                    alt={`${product.name} box`}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-all duration-700 ease-out opacity-0 scale-105 group-hover:opacity-90 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#FAFAF8] opacity-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex justify-between items-center pointer-events-none">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">View Details</span>
                    <ArrowRight className="w-4 h-4 text-[#8C7A6B]" />
                  </div>
                </Link>
                <div>
                  <h3 className="text-xl font-serif text-[#1A1A1A] tracking-wide mb-2 group-hover:text-[#8C7A6B] transition-colors">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">{product.category?.name || 'Signature'}</p>
                    <p className="text-sm font-medium text-[#1A1A1A] tracking-widest">Rs. {product.price?.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            )}) : (
              <div className="w-full flex justify-center py-24 border border-[#8C7A6B]/10 bg-[#F5F5F0]">
                <p className="text-[#8C7A6B] text-xs font-bold uppercase tracking-[0.2em]">Curating Collection...</p>
              </div>
            )}
          </div>
          
          {/* Horizontal Progress Bar */}
          <div className="w-full max-w-sm mx-auto h-px bg-[#1A1A1A]/10 mt-8 relative">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-[#8C7A6B]" 
              style={{ width: "100%", scaleX: scrollXProgress, transformOrigin: "left" }} 
            />
          </div>
        </div>
      </section>

      {/* 3. The Art of Perfumery (Editorial Text & Image) */}
      <section className="py-32 bg-[#FAFAF8] relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          <motion.div 
            style={{ y: ySection1 }}
            className="w-full lg:w-1/2 relative aspect-[3/4] overflow-hidden group"
          >
            <Image
              src="/alchemy.png"
              alt="Raw luxury perfume ingredients"
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2s]"
            />
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="w-full lg:w-1/2"
          >
            <motion.h3 variants={fadeUp} className="text-xs font-bold tracking-[0.3em] text-[#8C7A6B] uppercase mb-6">Our Philosophy</motion.h3>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-6xl font-serif text-[#1A1A1A] leading-[1.1] mb-10">
              The Alchemy of <br />
              <span className="italic text-gray-400">Nature & Time.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 font-light leading-relaxed mb-8">
              We travel to the farthest corners of the earth to source the most pristine botanicals, rare resins, and ethically harvested ouds. 
            </motion.p>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 font-light leading-relaxed mb-12">
              Every bottle is a testament to centuries-old extraction techniques, slowly matured in absolute darkness to ensure a fragrance that lingers on the soul.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/#about" className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#8C7A6B] pb-1 hover:text-[#8C7A6B] transition-colors">
                Discover Our Heritage
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Origin & About Us */}
      <section id="about" className="py-32 bg-[#FBFBFA] border-t border-[#8C7A6B]/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          <div className="w-full md:w-1/2">
            <h3 className="text-[10px] font-bold tracking-[0.4em] text-[#8C7A6B] uppercase mb-6" style={{ fontFamily: "var(--font-montserrat)" }}>
              Our Heritage
            </h3>
            <h2 className="text-4xl lg:text-6xl text-[#1C1C1C] leading-[1.1] mb-8" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              Born in Karachi,<br />
              <span className="italic text-[#8C7A6B]">Perfected in Paris.</span>
            </h2>
            <p className="text-sm text-gray-600 font-light leading-[2] mb-6" style={{ fontFamily: "var(--font-montserrat)" }}>
              Founded by visionary artisans, Al Furqan began as a clandestine atelier blending the raw, visceral intensity of Eastern ouds with the delicate, structured elegance of French floral extraction.
            </p>
            <p className="text-sm text-gray-600 font-light leading-[2] mb-10" style={{ fontFamily: "var(--font-montserrat)" }}>
              Today, our maison stands as a bridge between two worlds. We ethically source the world's most elusive ingredients, aging them in absolute darkness to create fragrances that don't just linger on the skin—they stain the memory.
            </p>
            <div className="h-px w-24 bg-[#1C1C1C]/10" />
          </div>
          <div className="w-full md:w-1/2 relative aspect-square bg-[#EFEFEA] overflow-hidden">
            <Image 
              src="/perfumes/p2.jpeg" 
              alt="Al Furqan Heritage" 
              fill 
              className="object-cover opacity-90 mix-blend-multiply filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8C7A6B]/20 to-transparent mix-blend-color" />
          </div>
        </div>
      </section>

      {/* 5. Bespoke Services */}
      <section id="custom-made" className="py-40 bg-[#1A1A1A] text-[#FAFAF8] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <h3 className="text-[10px] font-bold tracking-[0.4em] text-[#8C7A6B] uppercase mb-8" style={{ fontFamily: "var(--font-montserrat)" }}>
            Private Atelier
          </h3>
          <h2 className="text-3xl lg:text-7xl mb-10" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}>
            <span className="italic text-[#D4AF37]">Custom Made</span> Perfumes
          </h2>
          <p className="text-sm text-gray-400 font-light leading-[2] max-w-2xl mx-auto mb-14" style={{ fontFamily: "var(--font-montserrat)" }}>
            For our most discerning clientele, we offer the ultimate luxury: a fragrance composed entirely for you. Work directly with our master perfumers in a private consultation to craft a signature scent that belongs to you and you alone.
          </p>
          <a
            href="https://wa.me/923044216942?text=Hello%20Al%20Furqan%2C%20I%20am%20interested%20in%20a%20custom%20made%20fragrance%20consultation."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-[#D4AF37]/40 text-[#D4AF37] px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all duration-300 group"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Contact Us on WhatsApp</span>
          </a>
        </div>
      </section>

      {/* 6. Journal & Editorials */}
      <section id="journal" className="py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16 border-b border-[#1A1A1A]/10 pb-8">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-[#8C7A6B] uppercase mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>Editorial</h3>
              <h2 className="text-3xl md:text-4xl text-[#1A1A1A]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>The Journal</h2>
            </div>
            <Link href="#" className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">
              Read All Entries
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(cmsSettings?.journalEntries && cmsSettings.journalEntries.length > 0 
              ? cmsSettings.journalEntries 
              : [
                { title: "The Anatomy of Oud", date: "Oct 12, 2026", image: "/perfumes/p3.jpeg" },
                { title: "Distilling the Desert Rose", date: "Sep 28, 2026", image: "/perfumes/p4.jpeg" },
                { title: "A Conversation with the Founder", date: "Aug 15, 2026", image: "/perfumes/p5.jpeg" }
              ]
            ).map((post: any, i: number) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/3] bg-[#FBFBFA] mb-6 overflow-hidden border border-[#1A1A1A]/10">
                  <img src={post.image || post.img} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply transition-transform duration-[2s] group-hover:scale-105" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-3" style={{ fontFamily: "var(--font-montserrat)" }}>{post.date}</p>
                <h3 className="text-2xl text-[#1A1A1A] group-hover:text-[#8C7A6B] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>{post.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Al Furqan Promise (Trust Grid) */}
      <section className="py-24 lg:py-32 bg-[#F5F5F3]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <h3 className="text-sm font-serif text-[#1C1C1C] uppercase tracking-[0.2em] mb-4">Summer-Proof Longevity</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed font-sans">
              Formulated with ultra-high concentrations to withstand the intense heat and humidity of Karachi, ensuring your signature scent projects powerfully all day.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} 
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <h3 className="text-sm font-serif text-[#1C1C1C] uppercase tracking-[0.2em] mb-4">Imported Extrait Oils</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed font-sans">
              Sourced directly from world-class European fragrance houses. We blend premium raw materials to offer international-tier richness with zero synthetic harshness.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} 
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <h3 className="text-sm font-serif text-[#1C1C1C] uppercase tracking-[0.2em] mb-4">Same-Day Karachi Delivery</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed font-sans">
              Your fragrance arrives exactly when you need it. Secure hand-delivery straight from our boutique to your doorstep, beautifully packaged and gift-ready.
            </p>
          </motion.div>

        </div>
      </section>
      
    </div>
  );
}
