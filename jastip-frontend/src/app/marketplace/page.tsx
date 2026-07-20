"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Package, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/currency';

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [sortOption, setSortOption] = useState('Newest First');
  const [followedSellers, setFollowedSellers] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, [followingOnly, selectedCategory]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let endpoint = '/listings?';
      
      if (followingOnly && isAuthenticated && user) {
        endpoint += `followingOnly=true&followerId=${user.id}&`;
      }
      
      if (selectedCategory && selectedCategory !== 'All Items') {
        endpoint += `category=${encodeURIComponent(selectedCategory)}&`;
      }

      if (searchQuery) {
        endpoint += `search=${encodeURIComponent(searchQuery)}&`;
      }
      
      if (user?.preferredCurrency) {
        endpoint += `currency=${encodeURIComponent(user.preferredCurrency)}&`;
      }
      
      // Remove trailing ? or &
      endpoint = endpoint.replace(/[?&]$/, '');

      const response = await api.get(endpoint);
      
      let fetchedListings = response.data;
      if (sortOption === 'Lowest Price') {
        fetchedListings = fetchedListings.sort((a: any, b: any) => a.price - b.price);
      } else if (sortOption === 'Highest Price') {
        fetchedListings = fetchedListings.sort((a: any, b: any) => b.price - a.price);
      } else {
        // Newest First (default from backend usually, but let's enforce)
        fetchedListings = fetchedListings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      setListings(fetchedListings);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let sorted = [...listings];
    if (sortOption === 'Lowest Price') {
      sorted = sorted.sort((a: any, b: any) => a.price - b.price);
    } else if (sortOption === 'Highest Price') {
      sorted = sorted.sort((a: any, b: any) => b.price - a.price);
    } else {
      sorted = sorted.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setListings(sorted);
  }, [sortOption]);

  const handleOrder = async (listing: any) => {
    if (!isAuthenticated || !user) {
      alert("Please log in to place an order.");
      router.push('/login');
      return;
    }
    
    try {
      const res = await api.post('/orders', {
        tripId: listing.tripId,
        buyerId: user.id,
        productName: listing.productName,
        estimatedPrice: listing.price,
        localCurrency: listing.localCurrency,
        quantity: 1,
        category: listing.category
      });
      router.push(`/orders/${res.data.id}`);
    } catch (error: any) {
      console.error('Failed to order item', error);
      alert(`Failed to place order: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFollow = async (sellerId: string) => {
    if (!isAuthenticated || !user) {
      alert("Please log in to follow sellers.");
      router.push('/login');
      return;
    }
    
    // Optimistic UI update
    setFollowedSellers(prev => {
      const newSet = new Set(prev);
      newSet.add(sellerId);
      return newSet;
    });

    try {
      await api.post(`/users/${sellerId}/follow`);
    } catch (error) {
      console.error('Failed to follow seller', error);
      // Revert on failure
      setFollowedSellers(prev => {
        const newSet = new Set(prev);
        newSet.delete(sellerId);
        return newSet;
      });
      alert('Failed to follow seller.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-8 py-10">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchListings();
                }
              }}
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
        {['All Items', 'Trending', 'Electronics', 'Beauty', 'Fashion', 'Snacks & Food', 'Toys & Collectibles', 'Other'].map((tag) => (
          <button 
            key={tag} 
            onClick={() => setSelectedCategory(tag)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === tag ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-sm font-bold text-brand-navy bg-transparent outline-none cursor-pointer"
          >
            <option>Newest First</option>
            <option>Lowest Price</option>
            <option>Highest Price</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
              <div className="h-56 bg-gray-200 animate-pulse"></div>
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </section>
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
                    {formatCurrency(listing.price, listing.localCurrency)}
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
                        {followedSellers.has(listing.sellerId) ? (
                          <span className="text-[10px] font-bold text-gray-400">Following</span>
                        ) : (
                          <button onClick={() => handleFollow(listing.sellerId)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800">Follow</button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {listing.seller?.averageRating > 0 ? listing.seller.averageRating.toFixed(1) : 'New'}
                        </span>
                        {listing.seller?.reviewCount > 0 && (
                          <span className="text-[11px] text-gray-400">({listing.seller.reviewCount})</span>
                        )}
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
                  <button onClick={() => handleOrder(listing)} className="w-full bg-brand-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm smooth-hover">
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
        <button onClick={() => router.push('/trips')} className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-transparent smooth-hover whitespace-nowrap shadow-sm">
          Browse Trips
        </button>
      </div>

      {/* Load More Removed - Pagination not supported yet */}
    </div>
  );
}
