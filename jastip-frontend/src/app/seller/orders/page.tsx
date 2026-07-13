"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/orders?sellerId=${user.id}`);
        setOrders(response.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-navy"></div></div>;

  return (
    <main className="p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-navy mb-8">Active Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Active Orders Yet</h2>
          <p className="text-gray-500 max-w-md">Once buyers start placing orders on your listings, they will appear here for you to manage.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Trip Destination</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={order.productImageUrl || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=100&q=80"} alt={order.productName} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-bold text-brand-navy">{order.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                     {order.trip?.destinationCountry || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/seller/orders/${order.id}`} className="text-brand-accent font-bold hover:underline">
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
