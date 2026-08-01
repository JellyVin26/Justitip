"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Calendar, Package, ShieldCheck, Star, MapPin, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CURRENCIES = ["USD", "JPY", "EUR", "GBP", "KRW", "SGD", "AUD"];
const CATEGORIES = ["Trending", "Electronics", "Beauty", "Fashion", "Snacks & Food", "Toys & Collectibles", "Other"];

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    estimatedPrice: "",
    localCurrency: "USD",
    quantity: 1,
    category: "Trending",
  });

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`/trips/${params.id}`);
        setTrip(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch trip details");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchTripDetails();
  }, [params.id]);

  const parseMarkupRules = (rules: any) => {
    try {
      if (typeof rules === "string") {
        const parsed = JSON.parse(rules);
        return parsed.description || rules;
      }
      return rules?.description || "Standard markup rules apply.";
    } catch {
      return rules || "Standard markup rules apply.";
    }
  };

  const openModal = () => {
    if (!user) {
      alert("Please login as a buyer to request an item.");
      return router.push("/login");
    }
    setShowModal(true);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setCreatingOrder(true);
      const res = await api.post("/orders", {
        tripId: params.id,
        buyerId: user.id,
        productName: formData.productName,
        estimatedPrice: parseFloat(formData.estimatedPrice) || null,
        localCurrency: formData.localCurrency,
        quantity: Number(formData.quantity),
        category: formData.category,
      });
      router.push(`/orders/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create order", err);
      alert("Failed to submit request.");
      setCreatingOrder(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gold-400"></div>
    </div>
  );
  if (error) return <div className="min-h-screen bg-navy-950 pt-20 text-center text-red-400">{error}</div>;
  if (!trip) return <div className="min-h-screen bg-navy-950 pt-20 text-center font-bold text-zinc-400">Trip not found</div>;

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-navy-900">
          {/* Banner */}
          <div className="relative h-72 bg-navy-800">
            <img
              src={trip.image || "https://picsum.photos/seed/justitip-trip-detail/1200/600"}
              alt={trip.destinationCountry}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute bottom-8 left-8 z-10">
              <h1 className="flex items-center gap-2 text-4xl font-extrabold tracking-tight text-white">
                <MapPin size={26} className="text-gold-400" /> {trip.destinationCountry}
              </h1>
              <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white/90 backdrop-blur-md w-fit">
                <Calendar size={14} />
                {new Date(trip.startDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                <span className="mx-1">-</span>
                {new Date(trip.endDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="grid gap-10 p-6 sm:p-8 md:grid-cols-3">
            <div className="space-y-10 md:col-span-2">
              <section>
                <h2 className="mb-4 text-xl font-bold text-zinc-100">About this trip</h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {trip.notes || "No specific notes provided for this trip."}
                </p>
              </section>

              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-100">
                  <Package size={18} className="text-gold-400" /> Markup & fees
                </h2>
                <div className="rounded-2xl border border-white/5 bg-navy-950/60 p-5">
                  <p className="text-sm font-bold text-gold-300">{parseMarkupRules(trip.markupRules)}</p>
                </div>
              </section>
            </div>

            {/* Sticky action card */}
            <div className="relative">
              <div className="sticky top-24 rounded-2xl border border-white/10 bg-navy-900 p-6">
                <div className="mb-6 flex items-center gap-4 border-b border-white/5 pb-6">
                  <div
                    className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gold-400/15 text-lg font-bold text-gold-300"
                    onClick={(e) => { e.stopPropagation(); router.push(`/seller/${trip.sellerId}`); }}
                  >
                    {trip.seller?.name?.charAt(0) || "S"}
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-navy-900 p-0.5">
                      <ShieldCheck size={14} className="text-gold-400" />
                    </div>
                  </div>
                  <div>
                    <h3
                      className="cursor-pointer font-bold tracking-tight text-zinc-100 hover:underline"
                      onClick={(e) => { e.stopPropagation(); router.push(`/seller/${trip.sellerId}`); }}
                    >
                      {trip.seller?.name || "Verified justitiper"}
                    </h3>
                    <div className="mt-1 flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-zinc-300">
                        {trip.seller?.averageRating > 0 ? trip.seller.averageRating.toFixed(1) : "New"}
                      </span>
                      {trip.seller?.reviewCount > 0 && (
                        <span className="text-xs text-zinc-500">({trip.seller.reviewCount})</span>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={openModal} className="btn-primary w-full">
                  Request an item
                </button>
                <p className="mt-4 px-4 text-center text-[11px] font-medium leading-relaxed text-zinc-500">
                  Payment is secured by Justitip until you receive your item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-navy-900 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">Request an item</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRequest} className="space-y-5">
              <div>
                <label className="label-base">Item name</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="input-base !bg-navy-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                  placeholder="e.g. Rare Beauty Liquid Blush"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Est. price</label>
                  <input
                    type="number"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                    className="input-base !bg-navy-950 !border-zinc-700 !text-zinc-100 !placeholder-zinc-500"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="label-base">Currency</label>
                  <select
                    value={formData.localCurrency}
                    onChange={(e) => setFormData({ ...formData, localCurrency: e.target.value })}
                    className="input-base !bg-navy-950 !border-zinc-700 !text-zinc-100"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="input-base !bg-navy-950 !border-zinc-700 !text-zinc-100"
                  />
                </div>
                <div>
                  <label className="label-base">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-base !bg-navy-950 !border-zinc-700 !text-zinc-100"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-full px-4 py-3 font-bold text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {creatingOrder ? "Submitting..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
