"use client";
import { LayoutDashboard, Package, Wallet, Plus, Calendar, Clock, ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PostTripModal from "@/components/PostTripModal";

const CURRENCIES = ["IDR", "USD", "EUR", "JPY", "GBP", "AUD", "SGD"];

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [dashboardOrders, setDashboardOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostTripModalOpen, setIsPostTripModalOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState("IDR");
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const fetchRate = async () => {
      if (displayCurrency === "IDR") {
        setExchangeRate(1);
        return;
      }
      try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/IDR`);
        const data = await res.json();
        setExchangeRate(data.rates[displayCurrency] || 1);
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        setExchangeRate(1);
      }
    };
    fetchRate();
  }, [displayCurrency]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tripsResponse, ordersResponse] = await Promise.all([
        api.get(`/trips?sellerId=${user?.id}`),
        api.get(`/orders?sellerId=${user?.id}`),
      ]);
      setUpcomingTrips(tripsResponse.data);
      setDashboardOrders(ordersResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const completedOrders = dashboardOrders.filter((o) => o.status === "DELIVERED");
  const pendingOrders = dashboardOrders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const activeOrders = dashboardOrders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");

  // Earnings: total = sum of totalPriceIdr (the confirmed total), breakdown shown separately
  const totalEarningsIdr = completedOrders.reduce((sum, o) => sum + (o.totalPriceIdr || 0), 0);
  const totalBasePriceIdr = completedOrders.reduce((sum, o) => sum + ((o.originalPrice || 0) * (o.exchangeRate || 1)), 0);
  const totalMarkupIdr = completedOrders.reduce((sum, o) => sum + (o.markupFee || 0), 0);
  const totalShippingIdr = completedOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);

  const formatCurrency = (amountIdr: number) => {
    const converted = amountIdr * exchangeRate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: displayCurrency,
      maximumFractionDigits: displayCurrency === "IDR" || displayCurrency === "JPY" ? 0 : 2,
    }).format(converted);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name?.split(" ")[0] || "Seller"}</span>
            </h1>
            <p className="mt-1 text-zinc-400">Here's what's happening with your deliveries today.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 font-mono text-sm text-zinc-400">
            <Calendar size={15} /> {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Earnings */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 lg:col-span-2">
            <div className="mb-10 flex items-start justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Total earnings</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl font-extrabold tracking-tight text-zinc-100">{formatCurrency(totalEarningsIdr)}</h2>
                  {completedOrders.length === 0 && <span className="text-sm font-bold text-zinc-600">No data yet</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={displayCurrency}
                    onChange={(e) => setDisplayCurrency(e.target.value)}
                    className="cursor-pointer appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-2 pl-4 pr-10 text-sm font-bold text-zinc-100 outline-none transition-colors focus:border-emerald-500"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950">
                  <Wallet size={22} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Base price</p>
                <p className="text-xl font-extrabold text-zinc-100">{formatCurrency(totalBasePriceIdr)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Markup (profit)</p>
                <p className="text-xl font-extrabold text-emerald-400">{formatCurrency(totalMarkupIdr)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Shipping fees</p>
                <p className="text-xl font-extrabold text-zinc-100">{formatCurrency(totalShippingIdr)}</p>
              </div>
            </div>
          </div>

          {/* Pending orders */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-zinc-900 p-8">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-300">Pending orders</p>
                <h2 className="text-6xl font-extrabold text-zinc-100">{pendingOrders.length}</h2>
              </div>
              <Clock size={44} className="text-emerald-400/70" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Active orders */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-100">Active orders</h3>
              <Link href="/seller/orders" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
                <Package className="mb-3 h-12 w-12 text-zinc-700" />
                <p className="font-bold text-zinc-300">No active orders</p>
                <p className="text-sm text-zinc-500">When buyers purchase your listings, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.slice(0, 3).map((order) => (
                  <Link
                    href={`/seller/orders/${order.id}`}
                    key={order.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition-colors hover:border-white/20"
                  >
                    {order.productImageUrl ? (
                      <img src={order.productImageUrl} alt={order.productName} className="h-16 w-16 rounded-lg border border-white/5 object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-800 text-zinc-600">
                        <Package size={22} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="line-clamp-1 font-bold text-zinc-100">{order.productName}</h4>
                      <p className="mb-1 text-xs text-zinc-500">{order.buyer?.name || "Buyer"}</p>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming trips */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-100">Upcoming trips</h3>
              <button
                onClick={() => setIsPostTripModalOpen(true)}
                className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300"
              >
                <Plus size={15} /> New trip
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
                </div>
              ) : upcomingTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
                  <Calendar className="mb-3 h-12 w-12 text-zinc-700" />
                  <p className="font-bold text-zinc-300">No upcoming trips</p>
                  <p className="mb-4 text-sm text-zinc-500">Post your first trip to start earning.</p>
                  <button onClick={() => setIsPostTripModalOpen(true)} className="btn-primary">
                    Post trip
                  </button>
                </div>
              ) : (
                upcomingTrips.map((trip) => (
                  <div key={trip.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-colors hover:border-white/20">
                    <div className="relative h-24 bg-zinc-800">
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-300">{trip.destinationCountry}</h4>
                        <p className="font-mono text-xs text-zinc-400">
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex gap-8">
                        <div>
                          <p className="mb-1 font-mono text-xs text-zinc-500">Status</p>
                          <p className="text-sm font-bold text-zinc-100">{trip.status}</p>
                        </div>
                      </div>
                      <Link
                        href={`/seller/trips/${trip.id}`}
                        className="btn-dark !px-5 !py-2.5 text-xs"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <PostTripModal
          isOpen={isPostTripModalOpen}
          onClose={() => setIsPostTripModalOpen(false)}
          onSuccess={() => {
            setIsPostTripModalOpen(false);
            fetchDashboardData();
          }}
        />
      </div>
    </div>
  );
}
