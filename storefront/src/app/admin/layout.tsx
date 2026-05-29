import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import Sidebar from "@/components/admin/Sidebar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin - Al Furqan Perfumes",
  description: "Manage your store",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${playfair.variable} flex min-h-screen bg-[#FAFAF8]`}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
