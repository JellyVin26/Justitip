"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Package, ArrowRight, MapPin } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  REQUEST_SUBMITTED: "bg-navy-700/40 text-zinc-300",
  TRIP_CONFIRMED: "bg-blue-500/15 text-blue-300",
  PAID: "bg-gold-400/15 text-gold-300",
  ITEM_PURCHASED: "bg-gold-400/15 text-gold-300",
  IN_TRANSIT: "bg-amber-500/15 text-amber-300",
  DELIVERED: "bg-gold-400/15 text-gold-300",
  COMPLETED: "bg-gold-400/15 text-gold-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-navy-700/40 text-zinc-300";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredOrders = activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/orders?buyerId=${user.id}`);
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-navy-950">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gold-400"></div>
      </div>
    );

  const STATUS_TABS = ["ALL", "REQUEST_SUBMITTED", "TRIP_CONFIRMED", "PAID", "ITEM_PURCHASED", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED"];

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight">My orders</h1>
        <p className="mb-6 text-sm text-zinc-400">Track and manage all your item requests.</p>

        {/* Status tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "bg-gold-400 text-navy-950"
                  : "bg-navy-900 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {tab === "ALL" ? "All" : tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-navy-900 p-12 text-center">
            <Package className="mx-auto mb-4 h-14 w-14 text-zinc-700" />
            <h2 className="text-xl font-bold text-zinc-200">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-zinc-500">
              You haven't requested any items yet. Explore active trips to request an item!
            </p>
            <Link href="/explore" className="btn-primary mt-6">
              Explore trips <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900">
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Item</th>
                  <th className="px-6 py-4 font-bold">Destination</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.productImageUrl || "https://picsum.photos/seed/justitip-order/100/100"}
                          alt={order.productName}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-zinc-100">{order.productName}</p>
                          <p className="text-xs text-zinc-500">Qty: {order.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-300">
                      {order.trip?.destinationCountry || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 font-bold text-gold-400 hover:underline"
                      >
                        View details <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="divide-y divide-white/5 md:hidden">
              {filteredOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-white/5">
                  <img
                    src={order.productImageUrl || "https://picsum.photos/seed/justitip-order/100/100"}
                    alt={order.productName}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-zinc-100">{order.productName}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin size={11} /> {order.trip?.destinationCountry || "Unknown"} · Qty {order.quantity}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-zinc-600" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
