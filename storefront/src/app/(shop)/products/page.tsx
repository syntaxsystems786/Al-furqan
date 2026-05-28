import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import SortDropdown from '@/components/SortDropdown';
import TextReveal from '@/components/TextReveal';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams?.category;
  const search = resolvedParams?.search?.toLowerCase();
  const sort = resolvedParams?.sort;

  let products: any[] = [];
  try {
    products = await fetchProducts(category);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // backend not running – show empty state
  }

  const filteredProducts = search
    ? products.filter((p: any) => p.name.toLowerCase().includes(search))
    : [...products];

  if (sort === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const title = search
    ? `Results for "${resolvedParams?.search}"`
    : category
    ? `${category.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`
    : 'All Collections';

  return (
    <div className="w-full bg-[#FAFAF8] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-24 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-[#8C7A6B]/20 pb-8 pt-16">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A] mb-4 uppercase tracking-[0.2em]">
              <TextReveal>{title}</TextReveal>
            </h1>
            <p className="text-gray-500 font-bold text-xs tracking-[0.3em] uppercase">{filteredProducts.length} Olfactory Masterpieces</p>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4">
            <SortDropdown />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-40 flex flex-col items-center justify-center">
            <p className="text-2xl text-gray-500 font-serif mb-4 tracking-[0.2em] uppercase">No Fragrances Found</p>
            <p className="text-gray-600 font-light mb-8">
              {products.length === 0
                ? 'The boutique is being set up.'
                : 'Try a different filter or search term.'}
            </p>
            <Link href="/products" className="px-8 py-4 border border-[#8C7A6B] text-[#8C7A6B] font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#8C7A6B] hover:text-[#FAFAF8] transition-colors">
              View All Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-32">
            {filteredProducts.map((product: any, idx: number) => {
              const imageId = (idx % 5) + 1;
              const hoverImageId = ((idx + 1) % 5) + 1;
              // Use real DB images if available, else fall back to local placeholder
              const image = product.images?.[0]?.url
                ? product.images[0].url
                : `/perfumes/p${imageId}.jpeg`;
              const hoverImage = product.images?.[1]?.url
                ? product.images[1].url
                : `/perfumes/p${hoverImageId}.jpeg`;
              
              return (
                <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFFFFF] mb-8 border border-[#8C7A6B]/10">
                    {/* Primary image — fades out on hover */}
                    <img
                      src={image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-out group-hover:opacity-0 mix-blend-multiply"
                    />
                    {/* Hover / box image — fades in and scales on hover */}
                    <img
                      src={hoverImage}
                      alt={`${product.name} box`}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out opacity-0 scale-105 group-hover:opacity-90 group-hover:scale-110 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-[#FAFAF8] opacity-10 transition-opacity duration-1000 pointer-events-none" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-serif text-[#1A1A1A] group-hover:text-[#8C7A6B] transition-colors uppercase tracking-[0.2em] leading-tight mb-2">{product.name}</h3>
                    {product.category && (
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">{product.category.name}</p>
                    )}
                    <p className="mt-4 text-[#8C7A6B] font-medium tracking-widest text-sm">Rs. {product.price.toLocaleString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
