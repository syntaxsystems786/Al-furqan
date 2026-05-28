import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import SmoothScroll from "@/components/SmoothScroll";
import NoiseOverlay from "@/components/NoiseOverlay";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NoiseOverlay />
      <SmoothScroll>
        <CartProvider>
          <Navbar />
          <div className="pt-28">
            {children}
          </div>
        </CartProvider>
      </SmoothScroll>
    </>
  );
}
