"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'featured';

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <select 
      value={currentSort}
      onChange={handleSort}
      className="bg-white border border-[#8C7A6B]/30 text-[#1A1A1A] px-6 py-4 outline-none focus:border-[#8C7A6B] transition-colors uppercase text-xs font-bold tracking-[0.15em] cursor-pointer shadow-sm"
    >
      <option value="featured">Sort: Featured</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest Arrivals</option>
    </select>
  );
}
