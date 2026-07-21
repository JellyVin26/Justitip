"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Weight, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingOnly, setFollowingOnly] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTrips();
  }, [followingOnly]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let endpoint = '/trips';
      
      if (followingOnly && isAuthenticated && user) {
        endpoint += `?followingOnly=true&followerId=${user.id}`;
      }
      
      const response = await api.get(endpoint);
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-6xl mx-auto px-8 py-10">
      {/* Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Available <span className="italic text-gray-500 font-serif">Trips.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse scheduled trips by verified global couriers. Request items from their destination and have them delivered safely to your doorstep.
        </p>
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by destination city or country..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
            />
          </div>
          
          {/* Following Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            <button 
              onClick={() => setFollowingOnly(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${!followingOnly ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Trips
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

      {/* Results Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Showing {trips.length} active trips</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select className="text-sm font-bold text-brand-navy bg-transparent outline-none cursor-pointer">
            <option>Departure Date</option>
            <option>Highest Rating</option>
            <option>Most Capacity</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col h-[280px]">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              </div>
              <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </section>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No trips found</h3>
          <p className="text-gray-500">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <Link href={`/trips/${trip.id}`} key={trip.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col block">
              
              {/* Destination Image */}
              <div className="h-48 relative overflow-hidden bg-gray-100">
                <img src={trip.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80'} alt={trip.destinationCountry} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-white text-xl font-bold mb-1">{trip.destinationCountry}</h3>
                  <div className="flex items-center gap-1.5 text-gray-200 text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md w-fit">
                    <Calendar className="w-3 h-3" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col">
                
                {/* Seller Info */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div 
                      className="relative cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); router.push(`/seller/${trip.sellerId}`); }}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold">
                        {trip.seller?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p 
                          className="text-sm font-bold text-brand-navy cursor-pointer hover:underline"
                          onClick={(e) => { e.stopPropagation(); router.push(`/seller/${trip.sellerId}`); }}
                        >
                          {trip.seller?.name || 'Unknown'}
                        </p>
                        <button className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold hover:bg-blue-100">Follow</button>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {trip.seller?.averageRating > 0 ? trip.seller.averageRating.toFixed(1) : 'New'}
                        </span>
                        {trip.seller?.reviewCount > 0 && (
                          <span className="text-[11px] text-gray-400">({trip.seller.reviewCount})</span>
                        )}
                        {trip.seller?.completedTripsCount > 0 && (
                          <span className="text-[11px] text-gray-400 ml-1">• {trip.seller.completedTripsCount} trips</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  <button className="w-full bg-brand-navy text-white font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 smooth-hover flex items-center justify-center gap-2">
                    Request Item from {trip.seller?.name?.split(' ')[0] || 'Seller'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
      
      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="bg-white border border-gray-200 text-brand-navy font-bold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-sm smooth-hover">
          Load More Trips
        </button>
      </div>

    </div>
  );
}
