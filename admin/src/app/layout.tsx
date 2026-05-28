import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin - Al Furqan Perfumes",
  description: "Manage your store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfair.variable} antialiased bg-[#FAFAF8] text-[#1A1A1A] flex`}>
        <Sidebar />
        <main className="flex-1 ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
