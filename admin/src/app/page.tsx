"use client";

import { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { apiGetProducts, apiGetOrders } from '@/lib/api';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, ords] = await Promise.all([apiGetProducts(), apiGetOrders()]);
        setProducts(prods);
        setOrders(ords);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;

  const stats = [
    { name: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { name: 'Total Orders', value: orders.length.toString(), icon: ShoppingCart },
    { name: 'Pending Orders', value: pendingOrders.toString(), icon: TrendingUp },
    { name: 'Fragrances', value: products.length.toString(), icon: Package },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'border-yellow-400/50 text-yellow-700 bg-yellow-50',
    PROCESSING: 'border-blue-400/50 text-blue-700 bg-blue-50',
    SHIPPED: 'border-indigo-400/50 text-indigo-700 bg-indigo-50',
    DELIVERED: 'border-green-400/50 text-green-700 bg-green-50',
    CANCELLED: 'border-red-400/50 text-red-700 bg-red-50',
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-[#1A1A1A] tracking-[0.15em] uppercase">Dashboard</h1>
        <p className="text-gray-500 mt-2 text-sm tracking-wide">Welcome back. Here's your boutique at a glance.</p>
      </div>

      {loading ? (
        <div className="text-[#8C7A6B] tracking-[0.3em] uppercase text-sm font-bold">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white p-6 border border-[#8C7A6B]/15 hover:border-[#8C7A6B]/40 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-[0.2em]">{stat.name}</h2>
                    <div className="p-2 border border-[#8C7A6B]/20 bg-[#FAFAF8]">
                      <Icon className="w-4 h-4 text-[#8C7A6B]" />
                    </div>
                  </div>
                  <p className="text-3xl font-serif text-[#1A1A1A] tracking-wide">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-[#8C7A6B]/15 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#8C7A6B]/10">
              <h2 className="text-xl font-serif text-[#1A1A1A] tracking-widest uppercase">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#8C7A6B]/10 text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] bg-[#FAFAF8]">
                    <th className="p-5 font-bold">Order</th>
                    <th className="p-5 font-bold">Customer</th>
                    <th className="p-5 font-bold">City</th>
                    <th className="p-5 font-bold">Payment</th>
                    <th className="p-5 font-bold">Amount</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#8C7A6B]/10">
                  {orders.slice(0, 8).map((order: any) => (
                    <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-5 text-[#8C7A6B] font-bold tracking-widest">#{order.id}</td>
                      <td className="p-5 font-medium text-[#1A1A1A]">{order.customerName}</td>
                      <td className="p-5 text-gray-500">{order.city}</td>
                      <td className="p-5 text-gray-500 capitalize">{order.paymentMethod}</td>
                      <td className="p-5 text-[#1A1A1A] font-medium">Rs. {order.totalAmount.toLocaleString()}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase border ${statusColors[order.status] || 'border-gray-300 text-gray-600 bg-gray-50'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-16 text-center text-gray-400 tracking-[0.3em] uppercase text-sm">No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
