"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Package, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingOnly, setFollowingOnly] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchListings();
  }, [followingOnly]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let endpoint = '/listings';
      
      if (followingOnly && isAuthenticated && user) {
        endpoint += `?followingOnly=true&followerId=${user.id}`;
      }
      
      const response = await api.get(endpoint);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Available <span className="italic text-gray-500 font-serif">Items.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse exclusive items pre-listed by verified global couriers for their upcoming trips. Purchase directly from them and get it delivered fast.
        </p>
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by product name, brand, or country..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
            />
          </div>
          
          {/* Following Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            <button 
              onClick={() => setFollowingOnly(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${!followingOnly ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Items
            </button>
            <button 
              onClick={() => setFollowingOnly(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${followingOnly ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Following
            </button>
          </div>

          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-50 smooth-hover shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Categories / Tags */}
      <div className="flex gap-3 overflow-x-auto pb-6 mb-8 hide-scrollbar">
        {['All Items', 'Trending', 'Electronics', 'Beauty', 'Fashion', 'Snacks & Food', 'Toys & Collectibles'].map((tag, i) => (
          <button 
            key={tag} 
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              i === 0 ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Showing {listings.length} available items</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select className="text-sm font-bold text-brand-navy bg-transparent outline-none cursor-pointer">
            <option>Newest First</option>
            <option>Lowest Price</option>
            <option>Highest Price</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No items found</h3>
          <p className="text-gray-500">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              
              {/* Image Header */}
              <div className="h-56 relative overflow-hidden bg-gray-100">
                <img src={listing.imageUrl || 'https://images.unsplash.com/photo-1582283086938-163e9f45d5a7?w=300&q=80'} alt={listing.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                {/* Origin Badge */}
                <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-accent" /> From {listing.trip?.destinationCountry || 'Unknown'}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-brand-navy text-lg leading-tight mb-2 line-clamp-2">
                    {listing.productName}
                  </h3>
                  <p className="font-black text-brand-accent text-2xl">
                    ${listing.price} <span className="text-sm text-gray-400 font-medium">({listing.localCurrency})</span>
                  </p>
                </div>
                
                {/* Seller Info */}
                <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xs">
                        {listing.seller?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-brand-navy">{listing.seller?.name || 'Unknown'}</p>
                        <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800">Follow</button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                        <span className="text-[10px] font-bold text-gray-700">5.0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 justify-end">
                      <Package className="w-3.5 h-3.5" /> Stock
                    </p>
                    <p className="font-bold text-brand-navy text-sm leading-none mt-1">{listing.maxQuantity} left</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <button className="w-full bg-brand-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm smooth-hover">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
      
      {/* Custom Request Banner */}
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-brand-navy mb-2">Can't find what you're looking for?</h3>
          <p className="text-blue-800/80 max-w-lg">
            You can still submit a custom request directly to a seller going to your desired country. Head over to the Trips page to browse active routes.
          </p>
        </div>
        <button className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-transparent smooth-hover whitespace-nowrap shadow-sm">
          Browse Trips
        </button>
      </div>

      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="bg-white border border-gray-200 text-brand-navy font-bold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-sm smooth-hover">
          Load More Items
        </button>
      </div>

    </div>
  );
}
