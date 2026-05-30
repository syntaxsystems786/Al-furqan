"use client";

import { useEffect, useState } from 'react';
import { apiGetOrders, apiUpdateOrderStatus } from '@/lib/adminApi';
import { Check, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
// This caches the page and updates it in the background at most once every 15 minutes
export const revalidate = 900;
const statusColors: Record<string, string> = {
  PENDING: 'border-yellow-400/50 text-yellow-700 bg-yellow-50',
  PROCESSING: 'border-blue-400/50 text-blue-700 bg-blue-50',
  SHIPPED: 'border-indigo-400/50 text-indigo-700 bg-indigo-50',
  DELIVERED: 'border-green-400/50 text-green-700 bg-green-50',
  CANCELLED: 'border-red-400/50 text-red-700 bg-red-50',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filter, setFilter] = useState('ALL');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGetOrders();
      setOrders(data);
    } catch { showToast('Failed to load orders', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await apiUpdateOrderStatus(orderId, status);
      showToast('Order status updated');
      load();
      if (selectedOrder?.id === orderId) setSelectedOrder((o: any) => ({ ...o, status }));
    } catch { showToast('Failed to update status', 'error'); }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 shadow-lg flex items-center space-x-3 border ${toast.type === 'success' ? 'bg-white border-green-300 text-green-700' : 'bg-white border-red-300 text-red-600'}`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold tracking-wide text-sm">{toast.msg}</span>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-2xl sm:text-4xl font-serif text-[#1A1A1A] tracking-[0.1em] sm:tracking-[0.15em] uppercase">Orders</h1>
        <p className="text-gray-500 mt-2 text-sm tracking-wide">{orders.length} total orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {['ALL', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors border ${filter === s ? 'bg-[#8C7A6B] text-[#FAFAF8] border-[#8C7A6B]' : 'bg-white text-gray-500 border-[#8C7A6B]/20 hover:border-[#8C7A6B]/50 hover:text-[#8C7A6B]'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Orders Table */}
        <div className={`flex-1 bg-white border border-[#8C7A6B]/15 overflow-x-auto shadow-sm ${selectedOrder ? 'hidden lg:block' : ''}`}>
          {loading ? (
            <div className="p-16 text-center text-[#8C7A6B] tracking-[0.3em] uppercase text-sm font-bold">Loading orders...</div>
          ) : (
          <table className="w-full text-left min-w-[700px]">
              <thead className="border-b border-[#8C7A6B]/10 bg-[#FAFAF8]">
                <tr className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">
                  <th className="p-5 font-bold">Order</th>
                  <th className="p-5 font-bold">Customer</th>
                  <th className="p-5 font-bold">Payment</th>
                  <th className="p-5 font-bold">Amount</th>
                  <th className="p-5 font-bold">Status</th>
                  <th className="p-5 font-bold">Date</th>
                  <th className="p-5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8C7A6B]/10 text-sm">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                  >
                    <td className="p-5 text-[#8C7A6B] font-bold tracking-widest">#{order.id}</td>
                    <td className="p-5">
                      <div className="font-medium text-[#1A1A1A]">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{order.email}</div>
                    </td>
                    <td className="p-5 text-gray-500 capitalize text-xs tracking-widest">{order.paymentMethod}</td>
                    <td className="p-5 text-[#1A1A1A] font-medium">Rs. {order.totalAmount.toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase border ${statusColors[order.status] || 'border-gray-300 text-gray-600 bg-gray-50'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-5 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-5" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="text-xs bg-[#FAFAF8] border border-[#8C7A6B]/30 text-[#1A1A1A] p-2 focus:border-[#8C7A6B] focus:outline-none transition-colors"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={7} className="p-16 text-center text-gray-400 tracking-[0.3em] uppercase text-sm">No orders found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="w-full lg:w-96 bg-white border border-[#8C7A6B]/15 p-6 flex-shrink-0 h-fit sticky top-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#8C7A6B]/10">
              <h3 className="font-serif text-[#1A1A1A] tracking-widest uppercase text-lg">Order #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-[#8C7A6B] transition-colors">✕</button>
            </div>
            <div className="space-y-6 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-2 font-bold">Customer</p>
                <p className="font-medium text-[#1A1A1A]">{selectedOrder.customerName}</p>
                <p className="text-gray-500">{selectedOrder.email}</p>
                <p className="text-gray-500">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-2 font-bold">Shipping Address</p>
                <p className="text-gray-500">{selectedOrder.address}, {selectedOrder.city}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-2 font-bold">Payment</p>
                <p className="text-gray-500 capitalize">{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-3 font-bold">Fragrances Ordered</p>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-3 border-b border-[#8C7A6B]/10">
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{item.productName || 'Removed Item'}</p>
                      <p className="text-gray-500 text-xs mt-1">Volume: {item.productSize || 'N/A'} × {item.quantity}</p>
                    </div>
                    <p className="text-[#8C7A6B] font-medium">Rs. {(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-[#8C7A6B]/10">
                <span className="text-[#1A1A1A] text-xs tracking-[0.2em] uppercase font-bold">Total</span>
                <span className="text-[#8C7A6B] font-medium">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-3 font-bold">Update Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full p-3 bg-[#FAFAF8] border border-[#8C7A6B]/30 text-[#1A1A1A] text-sm focus:border-[#8C7A6B] focus:outline-none transition-colors"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
