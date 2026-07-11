"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import api from '@/lib/api';

export default function ExplorePage() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live trips from the backend API
    const fetchTrips = async () => {
      try {
        const response = await api.get('/trips');
        setTrips(response.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <section className="mb-14">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Discover your next <span className="italic text-gray-500 font-serif">global courier.</span>
        </h1>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Where do you need things from? (e.g. Tokyo, Paris, NYC)"
            className="w-full pl-12 pr-32 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm"
          />
          <button className="absolute inset-y-2 right-2 bg-brand-navy text-white px-6 rounded text-sm font-medium hover:bg-gray-800 smooth-hover">
            Search
          </button>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Live Now</p>
            <h2 className="text-2xl font-bold text-brand-navy">Active Trips</h2>
          </div>
          <button className="text-sm font-medium text-gray-600 hover:text-brand-navy">
            View All Trips &rarr;
          </button>
        </div>

        {/* Display dynamic trips */}
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-700">No active trips found</h3>
            <p className="text-gray-500">Check back later or explore other destinations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="relative h-[280px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 group cursor-pointer hover:shadow-md transition-all">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                 <img src={trip.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80'} alt={trip.destinationCountry} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                 
                 <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full">
                   <div className="w-5 h-5 rounded-full bg-brand-navy flex items-center justify-center text-[10px] font-bold text-white">
                     {trip.seller?.name?.charAt(0) || 'S'}
                   </div>
                   <span className="text-[10px] font-bold text-brand-navy pr-1">{trip.seller?.name?.split(' ')[0] || 'Seller'}</span>
                 </div>

                 <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="text-white text-lg font-bold leading-tight mb-1">{trip.destinationCountry}</h3>
                    <p className="text-gray-300 text-[11px] font-medium tracking-wide">
                      {new Date(trip.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(trip.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* CTA Section */}
      <section className="bg-brand-navy rounded-2xl p-12 text-center relative overflow-hidden mt-20">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Can't find your destination?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto text-sm">Create a custom request and let our global community of sellers reach out to you.</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-brand-navy px-6 py-3 rounded text-sm font-bold tracking-wide hover:bg-gray-100 smooth-hover">
              POST CUSTOM REQUEST
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
