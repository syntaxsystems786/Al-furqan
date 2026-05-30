export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-24">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-[#8C7A6B]/20 pb-8">
          <div className="w-full">
            <div className="h-16 md:h-24 bg-[#EFEFEA] animate-pulse w-3/4 md:w-1/2 mb-4"></div>
            <div className="h-4 bg-[#EFEFEA] animate-pulse w-48"></div>
          </div>
          <div className="w-full md:w-64 h-12 bg-[#EFEFEA] animate-pulse mt-8 md:mt-0"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-12 gap-y-16 sm:gap-y-32">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="relative aspect-[3/4] w-full bg-[#EFEFEA] animate-pulse mb-8 border border-[#8C7A6B]/10"></div>
              <div className="text-center flex flex-col items-center">
                <div className="h-6 sm:h-8 bg-[#EFEFEA] animate-pulse w-3/4 mb-2"></div>
                <div className="h-3 sm:h-4 bg-[#EFEFEA] animate-pulse w-1/2 mb-4"></div>
                <div className="h-4 sm:h-5 bg-[#EFEFEA] animate-pulse w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
