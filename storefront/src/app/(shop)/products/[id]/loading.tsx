export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Image */}
          <div className="w-full lg:w-1/2 p-6 lg:p-12 lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)]">
            <div className="relative w-full h-full aspect-[3/4] lg:aspect-auto bg-[#EFEFEA] animate-pulse border border-[#8C7A6B]/10"></div>
          </div>

          {/* Right Column - Info */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start py-8 px-6 lg:px-12">
            <div className="h-12 md:h-16 lg:h-20 bg-[#EFEFEA] animate-pulse w-3/4 mb-6"></div>
            <div className="h-8 bg-[#EFEFEA] animate-pulse w-1/4 mb-8"></div>
            
            <div className="space-y-4 mb-10 border-t border-[#8C7A6B]/15 pt-8">
              <div className="h-4 bg-[#EFEFEA] animate-pulse w-full"></div>
              <div className="h-4 bg-[#EFEFEA] animate-pulse w-full"></div>
              <div className="h-4 bg-[#EFEFEA] animate-pulse w-5/6"></div>
              <div className="h-4 bg-[#EFEFEA] animate-pulse w-4/6"></div>
            </div>

            <div className="h-32 bg-[#EFEFEA] animate-pulse w-full mb-12"></div>
            <div className="h-16 bg-[#EFEFEA] animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
