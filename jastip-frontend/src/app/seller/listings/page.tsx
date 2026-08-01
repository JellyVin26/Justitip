"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import AddListingModal from "@/components/AddListingModal";
import { Package, Trash2, Plus, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function SellerListingsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings?sellerId=${user?.id}`);
      setListings(res.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/listings/${listingId}`);
      fetchListings();
    } catch (error) {
      console.error("Failed to delete listing", error);
      alert("Failed to delete listing");
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">My listings</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} /> Add listing
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gold-400"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-navy-900 p-12 text-center">
            <Package size={56} className="mb-4 text-zinc-700" />
            <h2 className="text-xl font-bold text-zinc-200">You haven't listed any items</h2>
            <p className="mt-1 max-w-md text-zinc-500">
              Start adding items you plan to buy on your next trip to attract buyers.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-6">
              <Plus size={16} /> Add your first listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div key={listing.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 transition-colors hover:border-white/20">
                <div className="relative h-48 overflow-hidden bg-navy-800">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.productName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">No image</div>
                  )}
                  <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-navy-950/80 px-2 py-1 text-xs font-bold text-gold-300 backdrop-blur-sm">
                    {listing.localCurrency} {listing.price.toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-bold text-zinc-100">{listing.productName}</h3>
                  {listing.description && <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{listing.description}</p>}

                  <div className="mt-auto border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <MapPin size={11} /> Trip: <span className="font-bold text-zinc-300">{listing.trip?.destinationCountry || "Unknown"}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {listing.maxQuantity > 0 && (
                          <span className="font-medium text-gold-400">Max: {listing.maxQuantity}</span>
                        )}
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="p-1 text-zinc-600 transition-all hover:scale-110 hover:text-red-400"
                          title="Delete listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchListings();
          }}
        />
      </div>
    </div>
  );
}
