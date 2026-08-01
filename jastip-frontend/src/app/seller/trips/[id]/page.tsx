"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Package, List, Plus, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import AddListingModal from "@/components/AddListingModal";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function ManageTripPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchListings();
    }
  }, [id]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings?tripId=${id}`);
      setListings(res.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/seller/dashboard" className="mb-2 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-200">
              <ArrowLeft size={14} /> Back to dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Manage trip details</h1>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <List size={44} className="mb-3 text-zinc-700" />
            <h2 className="mb-2 text-xl font-bold text-zinc-100">Trip listings</h2>
            <p className="mb-6 text-sm text-zinc-500">
              You have {listings.length} item{listings.length === 1 ? "" : "s"} listed for this trip.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Add listing
            </button>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <Package size={44} className="mb-3 text-zinc-700" />
            <h2 className="mb-2 text-xl font-bold text-zinc-100">Trip orders</h2>
            <p className="mb-6 text-sm text-zinc-500">Review order requests from buyers for this specific trip.</p>
            <Link href="/seller/orders" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300">
              View requests
            </Link>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-extrabold tracking-tight">Listings for this trip</h2>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center text-zinc-500">
            No listings found for this trip. Click "Add listing" to start adding items!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div key={listing.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-colors hover:border-white/20">
                <div className="relative h-48 overflow-hidden bg-zinc-800">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.productName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">No image</div>
                  )}
                  <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-zinc-950/80 px-2 py-1 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                    {listing.localCurrency} {listing.price.toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-bold text-zinc-100">{listing.productName}</h3>
                  {listing.description && <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{listing.description}</p>}

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <MapPin size={11} /> <span className="font-bold text-zinc-300">{listing.trip?.destinationCountry || "Unknown"}</span>
                    </span>
                    {listing.maxQuantity > 0 && <span className="font-medium text-emerald-400">Max: {listing.maxQuantity}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          preSelectedTripId={id as string}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchListings();
          }}
        />
      </div>
    </div>
  );
}
