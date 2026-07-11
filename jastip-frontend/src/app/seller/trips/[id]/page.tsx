"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package, List, Plus } from 'lucide-react';
import Link from 'next/link';
import AddListingModal from '@/components/AddListingModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

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
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/seller/dashboard" className="text-sm text-gray-500 hover:text-brand-navy mb-2 block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-brand-navy">Manage Trip Details</h1>
        </div>
        <button className="bg-brand-navy text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 smooth-hover tracking-wide shadow-sm">
          Edit Trip Info
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
          <List className="w-12 h-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Trip Listings</h2>
          <p className="text-gray-500 mb-6 text-sm">You have {listings.length} item{listings.length === 1 ? '' : 's'} listed for this trip.</p>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-accent text-brand-navy px-4 py-2 rounded-md font-bold text-sm hover:bg-orange-400">
            <Plus className="w-4 h-4" /> Add Listing
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Trip Orders</h2>
          <p className="text-gray-500 mb-6 text-sm">Review order requests from buyers for this specific trip.</p>
          <Link href="/seller/orders" className="text-brand-navy font-bold text-sm hover:underline">
            View Requests
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-brand-navy mb-6">Listings for this Trip</h2>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No listings found for this trip. Click "Add Listing" to start adding items!
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
        preSelectedTripId={id as string}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchListings();
        }}
      />
    </main>
  );
}
