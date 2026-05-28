import type { Metadata } from "next";
import { Montserrat, Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import SmoothScroll from "@/components/SmoothScroll";
import NoiseOverlay from "@/components/NoiseOverlay";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Al Furqan Perfumes - Ultra Luxury Boutique",
  description: "Exquisite fragrances for the elite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${cinzel.variable} ${cormorant.variable} antialiased bg-[#FAFAF8] text-[#1A1A1A] selection:bg-[#8C7A6B] selection:text-[#FAFAF8]`}
        suppressHydrationWarning
      >
        <NoiseOverlay />
        <SmoothScroll>
          <CartProvider>
            <Navbar />
            <div className="pt-28">
              {children}
            </div>
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
