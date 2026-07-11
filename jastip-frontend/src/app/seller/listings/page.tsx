"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AddListingModal from '@/components/AddListingModal';
import { Package } from 'lucide-react';

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
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">My Listings</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-navy text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 smooth-hover tracking-wide shadow-sm">
          Add New Listing
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-navy"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm flex flex-col items-center text-center">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">You haven't listed any items</h2>
          <p className="text-gray-500 max-w-md">Start adding items you plan to buy on your next trip to attract buyers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col group">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.productName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-brand-navy shadow-sm">
                  {listing.localCurrency} {listing.price.toLocaleString()}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{listing.productName}</h3>
                {listing.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{listing.description}</p>}
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Trip: <span className="font-bold text-gray-700">{listing.trip?.destinationCountry || 'Unknown'}</span></span>
                    {listing.maxQuantity > 0 && <span className="text-brand-accent font-medium">Max: {listing.maxQuantity}</span>}
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
    </main>
  );
}
