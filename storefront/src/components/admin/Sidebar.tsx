"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Products', icon: Package, href: '/admin/products' },
  { name: 'Categories', icon: Package, href: '/admin/categories' },
  { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState('Admin');

  useEffect(() => {
    const user = localStorage.getItem('admin_user');
    if (user) setAdminUser(user);

    // Redirect to login if no token (only on non-login pages)
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return null;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#8C7A6B]/15 text-[#1A1A1A] flex flex-col z-50 shadow-sm">
      <div className="p-6 border-b border-[#8C7A6B]/10 text-center">
        <h1 className="text-2xl font-serif tracking-widest text-[#1A1A1A] uppercase">Al Furqan</h1>
        <p className="text-[#8C7A6B] text-[10px] mt-2 tracking-[0.3em] uppercase">Boutique Admin</p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-4 transition-all duration-300 border ${
                isActive
                  ? 'bg-[#8C7A6B]/10 text-[#8C7A6B] border-[#8C7A6B]/30'
                  : 'border-transparent text-gray-500 hover:text-[#8C7A6B] hover:bg-[#FAFAF8]'
              }`}
            >
              <Icon className="w-5 h-5 mr-4" />
              <span className="font-bold tracking-widest uppercase text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#8C7A6B]/10">
        <div className="px-4 py-2 mb-4">
          <p className="text-[10px] text-[#8C7A6B] uppercase tracking-[0.2em] mb-1 font-bold">Logged in as</p>
          <p className="text-[#1A1A1A] font-serif text-lg tracking-widest">{adminUser}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-4 text-gray-400 hover:text-[#8C7A6B] hover:bg-[#FAFAF8] transition-colors border border-transparent hover:border-[#8C7A6B]/20"
        >
          <LogOut className="w-5 h-5 mr-4" />
          <span className="font-bold tracking-widest uppercase text-xs">Logout</span>
        </button>
      </div>
    </aside>
  );
}
